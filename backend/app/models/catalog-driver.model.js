export default (sequelize, DataTypes) => {
  const Driver = sequelize.define(
    "driver",
    {
      driverId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: false },
      name: { type: DataTypes.STRING, allowNull: false },
    },
    { tableName: "drivers", timestamps: false }
  );

  return Driver;
};
