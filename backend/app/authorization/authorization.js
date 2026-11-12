import db from "../models/index.js";
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
}
