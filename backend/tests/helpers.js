import db from "../app/models/index.js";

/** Drop and recreate tables for the models registered in this feature. */
export const syncTestDatabase = async () => {
  await db.sequelize.sync({ force: true });
};

/**
 * Add feature-specific helpers here as you implement auth/lists/etc.
 * Example after Feature 1:
 *   export const registerUser = async (overrides = {}) => { … }
 */
