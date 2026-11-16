import { Sequelize } from "sequelize";
import sequelize from "../config/sequelizeInstance.js";
import userModel from "./user.model.js";
import sessionModel from "./session.model.js";
import areaModel from "./area.model.js";
import fuelTypeModel from "./fuelType.model.js";
import maintenanceInfoModel from "./maintenanceInfo.model.js";
import vehicleModel from "./vehicle.model.js";

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = userModel(sequelize, Sequelize);
db.session = sessionModel(sequelize, Sequelize);
db.area = areaModel(sequelize, Sequelize);
db.fuelType = fuelTypeModel(sequelize, Sequelize);
db.maintenanceInfo = maintenanceInfoModel(sequelize, Sequelize);
db.vehicle = vehicleModel(sequelize, Sequelize);

db.user.hasMany(db.session, { foreignKey: "userId" });
db.session.belongsTo(db.user, { foreignKey: "userId" });

db.area.hasMany(db.vehicle, { foreignKey: "area_id" });
db.vehicle.belongsTo(db.area, { foreignKey: "area_id" });

db.fuelType.hasMany(db.maintenanceInfo, { foreignKey: "fuel_type_id" });
db.maintenanceInfo.belongsTo(db.fuelType, { foreignKey: "fuel_type_id" });

export default db;
