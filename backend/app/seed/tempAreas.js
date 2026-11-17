/**
 * TEMPORARY — delete this module (and its call from server.js) when
 * Feature 13 Area CRUD is implemented. Vehicle create needs areas in the
 * dropdown before that feature exists.
 */
import db from "../models/index.js";
import logger from "../config/logger.js";

const TEMP_AREAS = [
  { name: "Engineering", noticeEmail: "engineering@example.com" },
  { name: "Facilities", noticeEmail: "facilities@example.com" },
  { name: "Campus Safety", noticeEmail: "safety@example.com" },
];

export default async function seedTempAreas() {
  for (const area of TEMP_AREAS) {
    const [, created] = await db.area.findOrCreate({
      where: { name: area.name },
      defaults: area,
    });
    if (created) {
      logger.info(`Temporary test area created: ${area.name}`);
    }
  }
}
