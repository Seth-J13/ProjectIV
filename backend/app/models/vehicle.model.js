export default (sequelize, DataTypes) => {
  const Vehicle = sequelize.define(
    "vehicle",
    {
      vehicleId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: false },
      license: { type: DataTypes.STRING, allowNull: false },
      make: { type: DataTypes.STRING, allowNull: false },
      model: { type: DataTypes.STRING, allowNull: false },
    },
    { tableName: "vehicles", timestamps: false }
  );

  return Vehicle;
};
