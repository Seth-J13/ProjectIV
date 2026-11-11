import { Sequelize } from "sequelize";
import sequelize from "../config/sequelizeInstance.js";

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

import driverModel from "./driver.model.js";

db.driver = driverModel(sequelize, Sequelize);

export default db;
