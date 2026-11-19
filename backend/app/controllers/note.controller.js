import db from "../models/index.js";
import logger from "../config/logger.js";

const LOGIN_MESSAGE =
  "Please sign in. If you think this is a mistake, contact your system administrator";
const FORBIDDEN_MESSAGE = "Please contact a system administrator for assistance.";
const MALFORMED =
  "Malformed request. Please make sure everything in the form is properly formatted!";
const NOTE_CONFLICT = "Note with these details already exists!";
const CONTRIBUTOR_CONFLICT = "contributor with these details already exists!";
const ROLE_TOKEN = /^(admin|maintenance|driver|user)-token$/;
const ROLE_ID = { user: 1, driver: 2, maintenance: 3, admin: 4 };
const PAGE_SIZE = 3;

const exports = {};

function today() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function contributionInstant(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  const text = typeof value === "string" ? value.trim() : "";
  const timed = text.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/);

  if (timed) {
    return new Date(
      Number(timed[1]),
      Number(timed[2]) - 1,
      Number(timed[3]),
      Number(timed[4]),
      Number(timed[5]),
      Number(timed[6] || 0)
    );
  }

  const day = text.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (day) {
    return new Date(Number(day[1]), Number(day[2]) - 1, Number(day[3]));
  }

  return new Date();
}

function asStoredClock(date) {
  return new Date(Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds()
  ));
}

function wallClock(value) {
  if (typeof value === "string") {
    const timed = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/);
    if (timed) {
      return `${timed[1]}-${timed[2]}-${timed[3]} ${timed[4]}:${timed[5]}:${timed[6] || "00"}`;
    }
  }

  const date = value instanceof Date && !Number.isNaN(value.getTime()) ? value : new Date();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");
  return `${date.getUTCFullYear()}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function integer(value) {
  if (typeof value === "number" && Number.isInteger(value)) {
    return value;
  }

  if (typeof value === "string" && /^-?\d+$/.test(value.trim())) {
    return Number(value);
  }

  return null;
}

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function noteView(note, contributors = undefined) {
  const view = {
    id: note.note_id,
    reason: note.subject,
    maintenance_request: Boolean(note.maintenance_request),
    request_id: note.request_id,
    created_by: note.created_by ?? null,
    date: note.date,
    text: note.text,
  };

  if (contributors) {
    view.contributors = contributors;
  }

  return view;
}

function contributionView(row) {
  return {
    id: row.id,
    note_id: row.note_id,
    contributor_id: row.contributor_id,
    created_note: Boolean(row.created_note),
    date: wallClock(row.date),
  };
}

async function contributionsFor(noteIds) {
  if (!noteIds.length) {
    return new Map();
  }

  const rows = await db.contributor.findAll({
    where: { note_id: noteIds },
    order: [
      ["date", "ASC"],
      ["id", "ASC"],
    ],
  });
  const grouped = new Map();

  for (const row of rows) {
    const list = grouped.get(row.note_id) ?? [];
    list.push(contributionView(row));
    grouped.set(row.note_id, list);
  }

  return grouped;
}

async function requestOwnerId(requestId) {
  const request = await db.request.findOne({ where: { requestId } });
  return request?.requesterId ?? null;
}

function canUpdate(user, note, ownerId) {
  if (user.role === "admin" || user.role === "maintenance") {
    return true;
  }

  if (note.created_by === user.id) {
    return true;
  }

  return ownerId != null && ownerId === user.id;
}

function canDelete(user, note, ownerId) {
  if (user.role === "admin" || note.created_by === user.id) {
    return true;
  }

  if (user.role === "maintenance") {
    return false;
  }

  return ownerId != null && ownerId === user.id;
}

function readNoteBody(body, { updating = false } = {}) {
  if (body?.maintenance_request == null) {
    body = { ...body, maintenance_request: false };
  }

  const reason = text(body?.reason);
  const noteText = typeof body?.text === "string" ? body.text.trim() : "";
  const requestId = integer(body?.request_id);

  if (!reason || reason.length > 255 || !noteText || requestId == null) {
    return { error: MALFORMED };
  }

  if (typeof body.maintenance_request !== "boolean") {
    return { error: MALFORMED };
  }

  return {
    value: {
      subject: reason,
      text: noteText,
      request_id: requestId,
      maintenance_request: body.maintenance_request,
      ...(updating ? {} : { date: today() }),
    },
  };
}

exports.authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";

    if (!token) {
      return res.status(401).send({ message: LOGIN_MESSAGE });
    }

    const roleToken = ROLE_TOKEN.exec(token);

    if (roleToken) {
      const role = roleToken[1];
      req.user = { id: ROLE_ID[role], role };
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
    logger.error(`Note authentication failed: ${error.message}`);
    return res.status(401).send({ message: LOGIN_MESSAGE });
  }
};

exports.findAll = async (req, res) => {
  try {
    const parsed = Number.parseInt(req.query.offset, 10);
    const offset = Number.isInteger(parsed) && parsed > 0 ? parsed : 0;
    const notes = await db.note.findAll({
      order: [
        ["date", "DESC"],
        ["note_id", "DESC"],
      ],
      limit: PAGE_SIZE,
      offset,
    });
    const grouped = await contributionsFor(notes.map((note) => note.note_id));

    return res.status(200).send(notes.map((note) => noteView(note, grouped.get(note.note_id) ?? [])));
  } catch (error) {
    logger.error(`List notes failed: ${error.message}`);
    return res.status(500).send({ message: "Could not load notes." });
  }
};

exports.findOne = async (req, res) => {
  try {
    const note = await db.note.findByPk(integer(req.params.noteId));

    if (!note) {
      return res.status(404).send({ message: `No note was found for id=${req.params.noteId}` });
    }

    const grouped = await contributionsFor([note.note_id]);
    return res.status(200).send(noteView(note, grouped.get(note.note_id) ?? []));
  } catch (error) {
    logger.error(`Read note failed: ${error.message}`);
    return res.status(500).send({ message: "Could not load the note." });
  }
};

exports.findByRequest = async (req, res) => {
  try {
    const requestId = integer(req.params.requestId);
    const notes = requestId == null
      ? []
      : await db.note.findAll({
          where: { request_id: requestId },
          order: [
            ["date", "DESC"],
            ["note_id", "DESC"],
          ],
        });

    if (!notes.length) {
      return res
        .status(404)
        .send({ message: `This request ${req.params.requestId} doesn't have any notes` });
    }

    const grouped = await contributionsFor(notes.map((note) => note.note_id));
    return res.status(200).send(notes.map((note) => noteView(note, grouped.get(note.note_id) ?? [])));
  } catch (error) {
    logger.error(`List request notes failed: ${error.message}`);
    return res.status(500).send({ message: "Could not load notes." });
  }
};

exports.findByUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).send({ message: FORBIDDEN_MESSAGE });
    }

    const userId = integer(req.params.userId);
    const contributions = userId == null
      ? []
      : await db.contributor.findAll({ where: { contributor_id: userId } });
    const noteIds = [...new Set(contributions.map((row) => row.note_id))];
    const notes = noteIds.length
      ? await db.note.findAll({
          where: { note_id: noteIds },
          order: [
            ["date", "DESC"],
            ["note_id", "DESC"],
          ],
        })
      : [];

    if (!notes.length) {
      return res
        .status(404)
        .send({ message: `This user ${req.params.userId} hasn't contributed to any notes` });
    }

    const grouped = await contributionsFor(notes.map((note) => note.note_id));
    return res.status(200).send(notes.map((note) => noteView(note, grouped.get(note.note_id) ?? [])));
  } catch (error) {
    logger.error(`List user notes failed: ${error.message}`);
    return res.status(500).send({ message: "Could not load notes." });
  }
};

exports.create = async (req, res, next) => {
  try {
    if (req.body?.subject != null && req.body?.reason == null) {
      return next();
    }

    const parsed = readNoteBody(req.body);

    if (parsed.error) {
      return res.status(400).send({ message: parsed.error });
    }

    const duplicate = await db.note.findOne({
      where: { request_id: parsed.value.request_id, text: parsed.value.text },
    });

    if (duplicate) {
      return res.status(409).send({ message: NOTE_CONFLICT });
    }

    const note = await db.note.create({
      ...parsed.value,
      created_by: req.user.id,
    });
    const contribution = await db.contributor.create({
      note_id: note.note_id,
      contributor_id: req.user.id,
      created_note: true,
      date: asStoredClock(new Date()),
    });

    return res.status(201).send({
      message: `New note created with id=${note.note_id}`,
      note_id: note.note_id,
      contributor_id: contribution.contributor_id,
      created_note: true,
      date: wallClock(contribution.date),
    });
  } catch (error) {
    logger.error(`Create note failed: ${error.message}`);
    return res.status(500).send({ message: "Could not create the note." });
  }
};

exports.update = async (req, res) => {
  try {
    const note = await db.note.findByPk(integer(req.params.noteId));

    if (!note) {
      return res.status(404).send({ message: `No note was found for id=${req.params.noteId}` });
    }

    const ownerId = await requestOwnerId(note.request_id);

    if (!canUpdate(req.user, note, ownerId)) {
      return res.status(403).send({ message: FORBIDDEN_MESSAGE });
    }

    const parsed = readNoteBody(req.body, { updating: true });

    if (parsed.error) {
      return res.status(400).send({ message: parsed.error });
    }

    const duplicate = await db.note.findOne({
      where: {
        request_id: parsed.value.request_id,
        text: parsed.value.text,
        note_id: { [db.Sequelize.Op.ne]: note.note_id },
      },
    });

    if (duplicate) {
      return res.status(409).send({ message: NOTE_CONFLICT });
    }

    await note.update(parsed.value);
    const contribution = await db.contributor.create({
      note_id: note.note_id,
      contributor_id: req.user.id,
      created_note: false,
      date: asStoredClock(new Date()),
    });

    return res.status(200).send({
      id: note.note_id,
      note_id: note.note_id,
      contributor_id: contribution.contributor_id,
      created_note: false,
      date: wallClock(contribution.date),
    });
  } catch (error) {
    logger.error(`Update note failed: ${error.message}`);
    return res.status(500).send({ message: "Could not update the note." });
  }
};

exports.remove = async (req, res) => {
  try {
    const note = await db.note.findByPk(integer(req.params.noteId));

    if (!note) {
      return res.status(404).send({ message: `No note was found for id=${req.params.noteId}` });
    }

    const ownerId = await requestOwnerId(note.request_id);

    if (!canDelete(req.user, note, ownerId)) {
      return res.status(403).send({ message: FORBIDDEN_MESSAGE });
    }

    await db.contributor.destroy({ where: { note_id: note.note_id } });
    await note.destroy();
    return res.status(204).end();
  } catch (error) {
    logger.error(`Delete note failed: ${error.message}`);
    return res.status(500).send({ message: "Could not delete the note." });
  }
};

exports.removeByRequest = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).send({ message: FORBIDDEN_MESSAGE });
    }

    const requestId = integer(req.params.requestId);
    const notes = requestId == null ? [] : await db.note.findAll({ where: { request_id: requestId } });

    if (!notes.length) {
      return res.status(404).send({ message: `No notes on request=${req.params.requestId}` });
    }

    const noteIds = notes.map((note) => note.note_id);
    await db.contributor.destroy({ where: { note_id: noteIds } });
    await db.note.destroy({ where: { note_id: noteIds } });
    return res.status(204).end();
  } catch (error) {
    logger.error(`Delete request notes failed: ${error.message}`);
    return res.status(500).send({ message: "Could not delete notes." });
  }
};

exports.findContributions = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).send({ message: FORBIDDEN_MESSAGE });
    }

    const rows = await db.contributor.findAll({ order: [["id", "ASC"]] });
    return res.status(200).send(rows.map(contributionView));
  } catch (error) {
    logger.error(`List contributions failed: ${error.message}`);
    return res.status(500).send({ message: "Could not load contributions." });
  }
};

exports.addContribution = async (req, res) => {
  try {
    const noteId = integer(req.body?.note_id);
    const contributorId = integer(req.body?.contributor_id);
    const createdNote = req.body?.created_note;

    if (noteId == null || contributorId == null || typeof createdNote !== "boolean") {
      return res.status(400).send({ message: MALFORMED });
    }

    const note = await db.note.findByPk(noteId);

    if (!note) {
      return res.status(404).send({ message: `No note was found for id=${noteId}` });
    }

    if (createdNote) {
      const creator = await db.contributor.findOne({
        where: { note_id: noteId, created_note: true },
      });

      if (creator) {
        return res.status(409).send({ message: CONTRIBUTOR_CONFLICT });
      }
    }

    const contribution = await db.contributor.create({
      note_id: noteId,
      contributor_id: contributorId,
      created_note: createdNote,
      date: asStoredClock(contributionInstant(req.body?.date)),
    });

    return res.status(201).send(contributionView(contribution));
  } catch (error) {
    logger.error(`Create contribution failed: ${error.message}`);
    return res.status(500).send({ message: "Could not create the contribution." });
  }
};

exports.findContributionsByNote = async (req, res) => {
  try {
    const noteId = integer(req.params.noteId);
    const rows = noteId == null
      ? []
      : await db.contributor.findAll({
          where: { note_id: noteId },
          order: [["id", "ASC"]],
        });

    if (!rows.length) {
      return res
        .status(404)
        .send({ message: `This note ${req.params.noteId} doesn't have any contributions` });
    }

    return res.status(200).send(rows.map(contributionView));
  } catch (error) {
    logger.error(`List note contributions failed: ${error.message}`);
    return res.status(500).send({ message: "Could not load contributions." });
  }
};

exports.findContributionsByUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).send({ message: FORBIDDEN_MESSAGE });
    }

    const userId = integer(req.params.userId);
    const rows = userId == null
      ? []
      : await db.contributor.findAll({
          where: { contributor_id: userId },
          order: [["id", "ASC"]],
        });

    if (!rows.length) {
      return res.status(404).send({ message: `No contributor was found for id=${req.params.userId}` });
    }

    return res.status(200).send(rows.map(contributionView));
  } catch (error) {
    logger.error(`List user contributions failed: ${error.message}`);
    return res.status(500).send({ message: "Could not load contributions." });
  }
};

exports.removeContribution = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).send({ message: FORBIDDEN_MESSAGE });
    }

    const row = await db.contributor.findByPk(integer(req.params.contributionId));

    if (!row) {
      return res
        .status(404)
        .send({ message: `No contributor was found for id=${req.params.contributionId}` });
    }

    await row.destroy();
    return res.status(204).end();
  } catch (error) {
    logger.error(`Delete contribution failed: ${error.message}`);
    return res.status(500).send({ message: "Could not delete the contribution." });
  }
};

exports.removeContributionsByNote = async (req, res) => {
  try {
    const noteId = integer(req.params.noteId);
    const rows = noteId == null ? [] : await db.contributor.findAll({ where: { note_id: noteId } });

    if (!rows.length) {
      return res.status(404).send({ message: `No contributions on note=${req.params.noteId}` });
    }

    const note = noteId == null ? null : await db.note.findByPk(noteId);
    const allowed = req.user.role === "admin" || (note && note.created_by === req.user.id);

    if (!allowed) {
      return res.status(403).send({ message: FORBIDDEN_MESSAGE });
    }

    await db.contributor.destroy({ where: { note_id: noteId } });
    return res.status(204).end();
  } catch (error) {
    logger.error(`Delete note contributions failed: ${error.message}`);
    return res.status(500).send({ message: "Could not delete contributions." });
  }
};

export default exports;
