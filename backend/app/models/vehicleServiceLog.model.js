export default (sequelize, Sequelize) => {
  const VehicleServiceLog = sequelize.define(
    "vehicleServiceLog",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      vehicle_id: {
        type: Sequelize.STRING(17),
        allowNull: false,
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING(40),
        allowNull: false,
      },
      value: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
    },
    {
      tableName: "vehicle_service_logs",
      timestamps: false,
    }
  );

  return VehicleServiceLog;
};
