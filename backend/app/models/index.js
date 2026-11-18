import { Sequelize } from "sequelize";
import sequelize from "../config/sequelizeInstance.js";
import userModel from "./user.model.js";
import sessionModel from "./session.model.js";

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

<<<<<<< HEAD
import driverModel from "./driver.model.js";

db.driver = driverModel(sequelize, Sequelize);
=======
db.user = userModel(sequelize, Sequelize);
db.session = sessionModel(sequelize, Sequelize);

db.user.hasMany(db.session, { foreignKey: "userId" });
db.session.belongsTo(db.user, { foreignKey: "userId" });
>>>>>>> 7e0f16e29febe48b6cbfd8b1dfb3e2c8664dbcdf

export default db;
