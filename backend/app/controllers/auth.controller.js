import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { Op } from "sequelize";
import db from "../models/index.js";
import logger from "../config/logger.js";
import authConfig from "../config/auth.config.js";

const SALT_ROUNDS = 10;
const SESSION_TTL_SECONDS = 86400;
const GOOGLE_ISSUERS = new Set(["https://accounts.google.com", "accounts.google.com"]);

const USER_NOT_FOUND = "User not found!";
const INVALID_PASSWORD = "Invalid password!";
const EMAIL_IN_USE = "Email already in use!";
const LOGGED_OUT = "Logged out successfully.";
const CREDENTIALS_REQUIRED = "Email and password are required.";
const ACCOUNT_FIELDS_REQUIRED = "First name, last name, email, and password are required.";
const GOOGLE_FAILED = "Google sign-in failed.";
const GOOGLE_NO_NAME = "Google did not provide a name.";

const exports = {};

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function authPayload(user, token) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    token,
  };
}

function readBasicCredentials(headerValue) {
  const match = /^Basic\s+(\S+)$/i.exec(headerValue || "");

  if (!match) {
    return null;
  }

  const decoded = Buffer.from(match[1], "base64").toString("utf8");
  const separator = decoded.indexOf(":");

  if (separator < 0) {
    return null;
  }

  const email = decoded.slice(0, separator).trim();
  const password = decoded.slice(separator + 1);

  if (!email || !password) {
    return null;
  }

  return { email, password };
}

async function findUserByEmail(email) {
  return db.user.unscoped().findOne({
    where: db.sequelize.where(
      db.sequelize.fn("LOWER", db.sequelize.col("email")),
      email.trim().toLowerCase()
    ),
  });
}

async function startSession(user, transaction) {
  const existing = await db.session.findOne({
    where: {
      userId: user.id,
      expirationDate: { [Op.gte]: new Date() },
    },
    order: [["expirationDate", "DESC"]],
    transaction,
  });

  if (existing) {
    return existing.token;
  }

  const token = jwt.sign({ id: user.id, email: user.email }, authConfig.secret, {
    expiresIn: SESSION_TTL_SECONDS,
  });
  const expirationDate = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);

  await db.session.create(
    {
      token,
      email: user.email,
      expirationDate,
      userId: user.id,
    },
    { transaction }
  );

  return token;
}

function audienceMatches(audience, clientId) {
  const audiences = Array.isArray(audience) ? audience : [audience];
  return audiences.includes(clientId);
}

function isExpired(payload) {
  if (payload.exp == null || payload.exp === "") {
    return false;
  }

  const expiresAt = Number(payload.exp);

  return !Number.isFinite(expiresAt) || expiresAt * 1000 <= Date.now();
}

async function verifyGoogleIdToken(idToken) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Google client is not configured.");
  }

  const client = new OAuth2Client(clientId, clientSecret);
  const ticket = await client.verifyIdToken({
    idToken,
    audience: clientId,
  });
  const payload = ticket.getPayload();

  if (
    !payload ||
    !GOOGLE_ISSUERS.has(payload.iss) ||
    !audienceMatches(payload.aud, clientId) ||
    isExpired(payload) ||
    payload.email_verified !== true ||
    !text(payload.email) ||
    !text(payload.sub)
  ) {
    throw new Error("Google ID token was rejected.");
  }

  return payload;
}

exports.register = async (req, res) => {
  const firstName = text(req.body?.firstName);
  const lastName = text(req.body?.lastName);
  const email = text(req.body?.email);
  const password = typeof req.body?.password === "string" ? req.body.password : "";

  if (!firstName || !lastName || !email || !password.trim()) {
    return res.status(400).send({ message: ACCOUNT_FIELDS_REQUIRED });
  }

  const transaction = await db.sequelize.transaction();

  try {
    const existing = await findUserByEmail(email);

    if (existing) {
      await transaction.rollback();
      return res.status(409).send({ message: EMAIL_IN_USE });
    }

    const user = await db.user.create(
      {
        firstName,
        lastName,
        email,
        password: await bcrypt.hash(password, SALT_ROUNDS),
        role: "user",
      },
      { transaction }
    );
    const token = await startSession(user, transaction);

    await transaction.commit();
    logger.debug(`Account created for ${user.email}`);
    return res.send(authPayload(user, token));
  } catch (error) {
    await transaction.rollback();

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).send({ message: EMAIL_IN_USE });
    }

    logger.error(`Register failed: ${error.message}`);
    return res.status(500).send({ message: "Unable to create account." });
  }
};

exports.login = async (req, res) => {
  const credentials = readBasicCredentials(req.headers.authorization);

  if (!credentials) {
    return res.status(401).send({ message: CREDENTIALS_REQUIRED });
  }

  try {
    const user = await findUserByEmail(credentials.email);

    if (!user) {
      logger.warn(`Login failed for ${credentials.email}: user not found`);
      return res.status(401).send({ message: USER_NOT_FOUND });
    }

    if (!user.password) {
      logger.warn(`Login failed for ${user.email}: invalid password`);
      return res.status(401).send({ message: INVALID_PASSWORD });
    }

    const passwordMatches = await bcrypt.compare(credentials.password, user.password);

    if (!passwordMatches) {
      logger.warn(`Login failed for ${user.email}: invalid password`);
      return res.status(401).send({ message: INVALID_PASSWORD });
    }

    const token = await startSession(user);
    logger.debug(`Login succeeded for ${user.email}`);
    return res.send(authPayload(user, token));
  } catch (error) {
    logger.error(`Login failed: ${error.message}`);
    return res.status(500).send({ message: "Unable to sign in." });
  }
};

exports.googleLogin = async (req, res) => {
  const idToken = typeof req.body?.idToken === "string" ? req.body.idToken.trim() : "";

  if (!idToken) {
    return res.status(400).send({ message: GOOGLE_FAILED });
  }

  let payload;

  try {
    payload = await verifyGoogleIdToken(idToken);
  } catch {
    logger.warn("Google sign-in failed.");
    return res.status(401).send({ message: GOOGLE_FAILED });
  }

  const firstName = text(payload.given_name);
  const lastName = text(payload.family_name);

  if (!firstName || !lastName) {
    return res.status(400).send({ message: GOOGLE_NO_NAME });
  }

  const email = text(payload.email);
  const googleSub = text(payload.sub);

  try {
    const existingBySub = await db.user.unscoped().findOne({ where: { googleSub } });

    if (existingBySub) {
      const token = await startSession(existingBySub);
      logger.debug(`Google login succeeded for ${existingBySub.email}`);
      return res.send(authPayload(existingBySub, token));
    }

    const existingByEmail = await findUserByEmail(email);

    if (existingByEmail) {
      logger.warn(`Google sign-in refused for ${email}: email already in use`);
      return res.status(409).send({ message: EMAIL_IN_USE });
    }

    const transaction = await db.sequelize.transaction();

    try {
      const user = await db.user.create(
        {
          firstName,
          lastName,
          email,
          password: null,
          role: "user",
          googleSub,
        },
        { transaction }
      );
      const token = await startSession(user, transaction);

      await transaction.commit();
      logger.debug(`Google account created for ${user.email}`);
      return res.send(authPayload(user, token));
    } catch (error) {
      await transaction.rollback();

      if (error.name === "SequelizeUniqueConstraintError") {
        return res.status(409).send({ message: EMAIL_IN_USE });
      }

      throw error;
    }
  } catch {
    logger.error("Google sign-in could not be completed.");
    return res.status(500).send({ message: "Unable to sign in." });
  }
};

exports.logout = async (req, res) => {
  try {
    await db.session.destroy({ where: { token: req.sessionToken } });
    logger.debug(`Logged out ${req.user.email}`);
    return res.send({ message: LOGGED_OUT });
  } catch (error) {
    logger.error(`Logout failed: ${error.message}`);
    return res.status(500).send({ message: "Unable to log out." });
  }
};

export default exports;
