import { Sequelize } from "sequelize";
import sequelize from "../config/sequelizeInstance.js";
import userModel from "./user.model.js";
import sessionModel from "./session.model.js";
import destinationModel from "./destination.model.js";
import driverModel from "./driver.model.js";
import areaModel from "./area.model.js";
import fuelTypeModel from "./fuelType.model.js";
import maintenanceInfoModel from "./maintenanceInfo.model.js";
import vehicleModel from "./vehicle.model.js";
import requestModel from "./request.model.js";
import noteModel from "./note.model.js";
import contributorModel from "./contributor.model.js";
import vehicleServiceLogModel from "./vehicleServiceLog.model.js";
import vehicleLogModel from "./vehicleLog.model.js";
import vehicleLogOwnerModel from "./vehicleLogOwner.model.js";

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = userModel(sequelize, Sequelize);
db.session = sessionModel(sequelize, Sequelize);
db.destination = destinationModel(sequelize, Sequelize);
db.driver = driverModel(sequelize, Sequelize);
db.area = areaModel(sequelize, Sequelize);
db.fuelType = fuelTypeModel(sequelize, Sequelize);
db.maintenanceInfo = maintenanceInfoModel(sequelize, Sequelize);
db.vehicle = vehicleModel(sequelize, Sequelize);
db.request = requestModel(sequelize, Sequelize);
db.note = noteModel(sequelize, Sequelize);
db.contributor = contributorModel(sequelize, Sequelize);
db.vehicleServiceLog = vehicleServiceLogModel(sequelize, Sequelize);
db.vehicleLog = vehicleLogModel(sequelize, Sequelize);
db.vehicleLogOwner = vehicleLogOwnerModel(sequelize, Sequelize);

db.user.hasMany(db.session, { foreignKey: "userId" });
db.session.belongsTo(db.user, { foreignKey: "userId" });

db.area.hasMany(db.vehicle, { foreignKey: "area_id" });
db.vehicle.belongsTo(db.area, { foreignKey: "area_id" });

db.fuelType.hasMany(db.maintenanceInfo, { foreignKey: "fuel_type_id" });
db.maintenanceInfo.belongsTo(db.fuelType, { foreignKey: "fuel_type_id" });

db.user.hasMany(db.note, { foreignKey: "created_by", constraints: false });
db.note.belongsTo(db.user, { foreignKey: "created_by", constraints: false });
db.request.hasMany(db.note, {
  foreignKey: "request_id",
  sourceKey: "requestId",
  constraints: false,
});
db.note.belongsTo(db.request, {
  foreignKey: "request_id",
  targetKey: "requestId",
  constraints: false,
});
db.note.hasMany(db.contributor, { foreignKey: "note_id", constraints: false });
db.contributor.belongsTo(db.note, { foreignKey: "note_id", constraints: false });
db.user.hasMany(db.contributor, { foreignKey: "contributor_id", constraints: false });
db.contributor.belongsTo(db.user, { foreignKey: "contributor_id", constraints: false });

db.vehicleLog.belongsTo(db.user, { as: "creator", foreignKey: "creatorId" });
db.user.hasMany(db.vehicleLog, { as: "createdVehicleLogs", foreignKey: "creatorId" });
db.vehicleLog.belongsToMany(db.user, {
  as: "owners",
  through: db.vehicleLogOwner,
  foreignKey: "vehicleLogId",
  otherKey: "userId",
});
db.user.belongsToMany(db.vehicleLog, {
  as: "ownedVehicleLogs",
  through: db.vehicleLogOwner,
  foreignKey: "userId",
  otherKey: "vehicleLogId",
});
db.vehicleLog.belongsTo(db.vehicle, { foreignKey: "vin", targetKey: "vin" });
db.vehicle.hasMany(db.vehicleLog, { foreignKey: "vin", sourceKey: "vin" });

export default db;
