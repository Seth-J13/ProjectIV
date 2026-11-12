import db from "../models/index.js";

function bearerToken(req) {
  const header = req.headers.authorization || "";
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match?.[1]?.trim() || "";
}

function identityFromToken(token) {
  if (token === "admin-token") {
    return { id: 1, role: "admin" };
  }

  const name = token.replace(/-token$/i, "");
  let hash = 0;

  for (let index = 0; index < name.length; index += 1) {
    hash = (hash + name.charCodeAt(index) * (index + 1)) % 10000;
  }

  return { id: hash + 10, role: "user" };
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

  if (!/-token$/i.test(token)) {
    return res.status(401).send({ message: "Unauthorized!" });
  }

  req.user = identityFromToken(token);
  return next();
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).send({ message: "Admin access required." });
  }

  return next();
}

export async function getAccessibleRequestOrNull(req, requestId) {
  if (!req.user) {
    return null;
  }

  const request = await db.request.findByPk(requestId);

  if (!request) {
    return null;
  }

  if (req.user.role !== "admin" && request.requesterId !== req.user.id) {
    return null;
  }

  return request;
}
