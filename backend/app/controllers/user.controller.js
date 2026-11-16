import db from "../models/index.js";
import logger from "../config/logger.js";

const ROLES = new Set(["user", "driver", "maintenance", "admin"]);
const FIELDS_REQUIRED = "First name, last name, email, and a valid role are required.";
const EMAIL_IN_USE = "Email already in use!";
const OWN_ROLE = "You cannot change your own role.";

const exports = {};

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function publicUser(user) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
  };
}

async function findOtherUserByEmail(email, userId) {
  const existing = await db.user.findOne({
    where: db.sequelize.where(
      db.sequelize.fn("LOWER", db.sequelize.col("email")),
      email.toLowerCase()
    ),
  });

  if (!existing || existing.id === userId) {
    return null;
  }

  return existing;
}

exports.findAll = async (_req, res) => {
  try {
    const users = await db.user.findAll({
      order: [["lastName", "ASC"]],
    });

    res.send(users.map(publicUser));
  } catch (error) {
    logger.error(`List users failed: ${error.message}`);
    res.status(500).send({ message: "Could not list users." });
  }
};

exports.update = async (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (Number.isNaN(id)) {
    res.status(404).send({ message: `User with id=${req.params.id} not found.` });
    return;
  }

  const firstName = text(req.body?.firstName);
  const lastName = text(req.body?.lastName);
  const email = text(req.body?.email);
  const role = text(req.body?.role);

  if (!firstName || !lastName || !email || !ROLES.has(role)) {
    res.status(400).send({ message: FIELDS_REQUIRED });
    return;
  }

  try {
    const user = await db.user.findByPk(id);

    if (!user) {
      res.status(404).send({ message: `User with id=${id} not found.` });
      return;
    }

    if (Number(req.user.id) === Number(user.id) && role !== user.role) {
      res.status(400).send({ message: OWN_ROLE });
      return;
    }

    const taken = await findOtherUserByEmail(email, user.id);

    if (taken) {
      res.status(409).send({ message: EMAIL_IN_USE });
      return;
    }

    await db.sequelize.transaction(async (transaction) => {
      await user.update({ firstName, lastName, email, role }, { transaction });
      await db.session.update({ email }, { where: { userId: user.id }, transaction });
    });

    res.send(publicUser(user));
  } catch (error) {
    logger.error(`Update user failed: ${error.message}`);
    res.status(500).send({ message: "Could not update user." });
  }
};

export default exports;
