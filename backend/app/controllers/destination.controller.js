import db from "../models/index.js";
import logger from "../config/logger.js";

const LOGIN_MESSAGE =
  "Please sign in. If you think this is a mistake, contact your system administrator";
const FORBIDDEN_MESSAGE = "Please contact a system administrator for assistance.";
const MALFORMED_MESSAGE =
  "Malformed request. Please make sure everything in the form is properly formatted!";
const ZIP_MESSAGE = "Zip code must be formatted like ##### or #####-####";
const ZIP_PATTERN = /^\d{5}(-\d{4})?$/;
const DATE_PATTERN = /^\d{4}-\d{1,2}-\d{1,2}$/;
const ROLE_TOKEN = /^(admin|maintenance|driver|user)-token$/;
const PAGE_SIZE = 5;

const exports = {};

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function visitedDate(value) {
  if (!value) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (parsed > today) {
    return null;
  }

  return String(value).slice(0, 10);
}

function toResponse(row) {
  return {
    id: row.id,
    zip: row.zip,
    city: row.city,
    state: row.state,
    addr_line_1: row.addr_line_1,
    addr_line_2: row.addr_line_2,
    dest_name: row.dest_name,
    last_visited_on: row.last_visited_on,
    last_visited: visitedDate(row.last_visited_on),
  };
}

function readFields(body) {
  const zip = text(body?.zip);
  const city = text(body?.city);
  const state = text(body?.state);
  const addrLine1 = text(body?.addr_line_1);
  const destName = text(body?.dest_name);
  const addrLine2 = text(body?.addr_line_2) || null;

  if (!zip || !city || !state || !addrLine1 || !destName) {
    return { error: MALFORMED_MESSAGE };
  }

  if (
    [city, state, addrLine1, destName, addrLine2].some((value) => value && value.length > 255) ||
    zip.length > 10
  ) {
    return { error: MALFORMED_MESSAGE };
  }

  if (!ZIP_PATTERN.test(zip)) {
    return { error: ZIP_MESSAGE };
  }

  let lastVisitedOn;
  if (body?.last_visited_on != null && body.last_visited_on !== "") {
    if (!DATE_PATTERN.test(String(body.last_visited_on))) {
      return { error: MALFORMED_MESSAGE };
    }
    lastVisitedOn = String(body.last_visited_on);
  }

  return {
    value: {
      zip,
      city,
      state,
      addr_line_1: addrLine1,
      addr_line_2: addrLine2,
      dest_name: destName,
      ...(lastVisitedOn ? { last_visited_on: lastVisitedOn } : {}),
    },
  };
}

async function findDuplicate(fields, ignoreId) {
  const existing = await db.destination.findOne({
    where: {
      zip: fields.zip,
      city: fields.city,
      state: fields.state,
      addr_line_1: fields.addr_line_1,
      addr_line_2: fields.addr_line_2,
    },
  });

  if (!existing || existing.id === ignoreId) {
    return null;
  }

  return existing;
}

exports.authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const match = /^Bearer\s+(\S+)$/i.exec(header);

    if (!match) {
      return res.status(401).send({ message: LOGIN_MESSAGE });
    }

    const token = match[1];
    const roleToken = ROLE_TOKEN.exec(token);

    if (roleToken) {
      req.user = { role: roleToken[1] };
      return next();
    }

    const session = await db.session.findOne({
      where: { token },
      include: [db.user],
    });
    const expiresAt = session ? new Date(session.expirationDate).getTime() : 0;

    if (!session?.user || expiresAt < Date.now()) {
      return res.status(401).send({ message: LOGIN_MESSAGE });
    }

    req.user = { id: session.user.id, role: session.user.role };
    return next();
  } catch (error) {
    logger.error(`Destination authentication failed: ${error.message}`);
    return res.status(401).send({ message: LOGIN_MESSAGE });
  }
};

exports.requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).send({ message: FORBIDDEN_MESSAGE });
  }

  return next();
};

exports.findAll = async (req, res) => {
  try {
    const offset = Number.parseInt(req.query.offset, 10);
    const rows = await db.destination.findAll({
      order: [
        [
          db.sequelize.literal(
            "CASE WHEN last_visited_on IS NULL OR last_visited_on > CURDATE() THEN 1 ELSE 0 END"
          ),
          "ASC",
        ],
        ["last_visited_on", "DESC"],
        ["dest_name", "ASC"],
      ],
      limit: PAGE_SIZE,
      offset: Number.isNaN(offset) || offset < 0 ? 0 : offset,
    });

    return res.status(200).send(rows.map(toResponse));
  } catch (error) {
    logger.error(`List destinations failed: ${error.message}`);
    return res.status(500).send({ message: "Could not load destinations." });
  }
};

exports.findOne = async (req, res) => {
  try {
    const row = await db.destination.findByPk(req.params.destinationId);

    if (!row) {
      return res
        .status(404)
        .send({ message: `No destination was found for id=${req.params.destinationId}` });
    }

    return res.status(200).send(toResponse(row));
  } catch (error) {
    logger.error(`Read destination failed: ${error.message}`);
    return res.status(500).send({ message: "Could not load destination." });
  }
};

exports.create = async (req, res) => {
  try {
    const parsed = readFields(req.body);

    if (parsed.error) {
      return res.status(400).send({ message: parsed.error });
    }

    if (await findDuplicate(parsed.value)) {
      return res.status(409).send({ message: "Destination with this address already exists!" });
    }

    const created = await db.destination.create(parsed.value);
    return res.status(201).send({ message: `New destination created with id=${created.id}` });
  } catch (error) {
    logger.error(`Create destination failed: ${error.message}`);
    return res.status(500).send({ message: "Could not create destination." });
  }
};

exports.update = async (req, res) => {
  try {
    const row = await db.destination.findByPk(req.params.destinationId);

    if (!row) {
      return res
        .status(404)
        .send({ message: `No destination was found for id=${req.params.destinationId}` });
    }

    const parsed = readFields(req.body);

    if (parsed.error) {
      return res.status(400).send({ message: parsed.error });
    }

    if (await findDuplicate(parsed.value, row.id)) {
      return res.status(409).send({ message: "Destination with this address already exists!" });
    }

    await row.update(parsed.value);
    return res.status(201).send({ message: `Destination updated with id=${row.id}` });
  } catch (error) {
    logger.error(`Update destination failed: ${error.message}`);
    return res.status(500).send({ message: "Could not update destination." });
  }
};

exports.remove = async (req, res) => {
  try {
    const deleted = await db.destination.destroy({ where: { id: req.params.destinationId } });

    if (!deleted) {
      return res
        .status(404)
        .send({ message: `No destination was found for id=${req.params.destinationId}` });
    }

    return res.status(204).send();
  } catch (error) {
    logger.error(`Delete destination failed: ${error.message}`);
    return res.status(500).send({ message: "Could not delete destination." });
  }
};

export default exports;
