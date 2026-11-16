import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import db from "../models/index.js";
import logger from "../config/logger.js";
import authConfig from "../config/auth.config.js";

const SESSION_TTL_SECONDS = 86400;
const USER_NOT_FOUND = "User not found!";
const INVALID_PASSWORD = "Invalid password!";
const CREDENTIALS_REQUIRED = "Email and password are required.";

const exports = {};

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

async function startSession(user) {
  const existing = await db.session.findOne({
    where: {
      userId: user.id,
      expirationDate: { [Op.gte]: new Date() },
    },
    order: [["expirationDate", "DESC"]],
  });

  if (existing) {
    return existing.token;
  }

  const token = jwt.sign({ id: user.id, email: user.email }, authConfig.secret, {
    expiresIn: SESSION_TTL_SECONDS,
  });

  await db.session.create({
    token,
    email: user.email,
    expirationDate: new Date(Date.now() + SESSION_TTL_SECONDS * 1000),
    userId: user.id,
  });

  return token;
}

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

    const passwordMatches = await bcrypt.compare(credentials.password, user.password);

    if (!passwordMatches) {
      logger.warn(`Login failed for ${credentials.email}: invalid password`);
      return res.status(401).send({ message: INVALID_PASSWORD });
    }

    const token = await startSession(user);

    return res.send({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      token,
    });
  } catch (error) {
    logger.error(`Login failed: ${error.message}`);
    return res.status(500).send({ message: "Login failed." });
  }
};

export default exports;
