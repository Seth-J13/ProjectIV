import { Sequelize } from "sequelize";
import sequelize from "../config/sequelizeInstance.js";

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

import vehicleModel from "./vehicle.model.js";
import driverModel from "./catalog-driver.model.js";
import destinationModel from "./destination.model.js";
import requestModel from "./request.model.js";

db.vehicle = vehicleModel(sequelize, Sequelize);
db.driver = driverModel(sequelize, Sequelize);
db.destination = destinationModel(sequelize, Sequelize);
db.request = requestModel(sequelize, Sequelize);

export default db;
