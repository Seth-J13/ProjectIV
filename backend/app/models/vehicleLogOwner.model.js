export default (sequelize, DataTypes) => {
  const VehicleLogOwner = sequelize.define(
    "vehicleLogOwner",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      vehicleLogId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "vehicle_log_owners",
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["vehicleLogId", "userId"],
        },
      ],
    }
  );

  return VehicleLogOwner;
};
