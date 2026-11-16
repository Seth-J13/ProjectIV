export default (sequelize, Sequelize) => {
  const MaintenanceInfo = sequelize.define(
    "maintenanceInfo",
    {
      make: {
        type: Sequelize.STRING(30),
        primaryKey: true,
        allowNull: false,
      },
      model: {
        type: Sequelize.STRING(65),
        primaryKey: true,
        allowNull: false,
      },
      year: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
      },
      fuel_type_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      fuel_capacity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      oil_viscosity: {
        type: Sequelize.CHAR(3),
        allowNull: false,
        defaultValue: "5W4",
      },
      recommended_tire_psi: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
      },
      tire_type: {
        type: Sequelize.STRING(17),
        allowNull: false,
      },
    },
    {
      tableName: "maintenance_info",
      timestamps: false,
    }
  );

  return MaintenanceInfo;
};
