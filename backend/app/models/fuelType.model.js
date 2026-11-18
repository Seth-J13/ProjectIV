export default (sequelize, Sequelize) => {
  const FuelType = sequelize.define(
    "fuelType",
    {
      fuel_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      fuel_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
    },
    {
      tableName: "fuel_types",
      timestamps: false,
    }
  );

  return FuelType;
};
