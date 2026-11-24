export default (sequelize, DataTypes) => {
  const VehicleLog = sequelize.define(
    "vehicleLog",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      serviceDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      vin: {
        type: DataTypes.STRING(17),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      completed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      creatorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "vehicle_logs",
    }
  );

  return VehicleLog;
};
