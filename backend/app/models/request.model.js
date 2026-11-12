export default (sequelize, DataTypes) => {
  const Request = sequelize.define(
    "request",
    {
      requestId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      requestType: { type: DataTypes.ENUM("trip", "maintenance"), allowNull: false },
      requesterId: { type: DataTypes.INTEGER, allowNull: false },
      vehicleId: { type: DataTypes.INTEGER, allowNull: false },
      driverId: { type: DataTypes.INTEGER, allowNull: true },
      destId: { type: DataTypes.INTEGER, allowNull: true },
      startDate: { type: DataTypes.STRING, allowNull: true },
      startTime: { type: DataTypes.STRING, allowNull: true },
      endDate: { type: DataTypes.STRING, allowNull: true },
      endTime: { type: DataTypes.STRING, allowNull: true },
      numPeople: { type: DataTypes.INTEGER, allowNull: true },
      currentlyActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    { tableName: "requests", timestamps: false }
  );

  return Request;
};
