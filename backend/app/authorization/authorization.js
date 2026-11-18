import db from "../models/index.js";
<<<<<<< HEAD

function bearerToken(req) {
  const header = req.headers.authorization || "";
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match?.[1]?.trim() || "";
}

export async function authenticate(req, res, next) {
  const token = bearerToken(req);

  if (!token) {
    return res.status(401).send({ message: "Unauthorized!" });
  }

  if (db.session && db.user) {
    const session = await db.session.findOne({ where: { token } });
    const expired = !session || new Date(session.expirationDate).getTime() < Date.now();

    if (expired) {
      return res.status(401).send({ message: "Unauthorized!" });
    }

    const user = await db.user.findByPk(session.userId);

    if (!user) {
      return res.status(401).send({ message: "Unauthorized!" });
    }

    req.user = { id: user.id, role: user.role };
    return next();
  }

  const roleToken = /^([A-Za-z]+)-token$/.exec(token);

  if (!roleToken) {
    return res.status(401).send({ message: "Unauthorized!" });
  }

  req.user = {
    id: roleToken[1].toLowerCase() === "admin" ? 1 : 2,
    role: roleToken[1].toLowerCase(),
  };
  return next();
=======
import logger from "../config/logger.js";

export async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const match = /^Bearer\s+(\S+)$/i.exec(header);

    if (!match) {
      return res.status(401).send({ message: "Unauthorized!" });
    }

    const token = match[1];
    const session = await db.session.findOne({
      where: { token },
      include: [db.user],
    });

    const expiresAt = session ? new Date(session.expirationDate).getTime() : 0;

    if (!session?.user || expiresAt < Date.now()) {
      return res.status(401).send({ message: "Unauthorized!" });
    }

    req.user = {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
    };
    req.sessionToken = session.token;
    return next();
  } catch (error) {
    logger.error(`Authentication failed: ${error.message}`);
    return res.status(401).send({ message: "Unauthorized!" });
  }
>>>>>>> 7e0f16e29febe48b6cbfd8b1dfb3e2c8664dbcdf
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).send({ message: "Admin access required." });
  }

  return next();
<<<<<<< HEAD
}

export async function getAccessibleDriversOrNull(req, driverId) {
  if (!req.user) {
    return null;
  }

  const driver = await db.driver.findByPk(driverId);
  return driver ?? null;
=======
>>>>>>> 7e0f16e29febe48b6cbfd8b1dfb3e2c8664dbcdf
}
