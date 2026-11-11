import db from "../models/index.js";

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
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).send({ message: "Unauthorized. Administrator role required." });
  }

  return next();
}

export async function getAccessibleDriversOrNull(req, driverId) {
  if (!req.user) {
    return null;
  }

  const driver = await db.driver.findByPk(driverId);
  return driver ?? null;
}
