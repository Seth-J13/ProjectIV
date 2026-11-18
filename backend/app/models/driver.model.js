export default (sequelize, Sequelize) => {
  const Driver = sequelize.define(
    'driver',
    {
      driver_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      license_status: {
        type: Sequelize.ENUM('expired', 'active', 'suspended'),
        allowNull: false,
      },
      license_exp_date: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      availability: {
        type: Sequelize.ENUM('available', 'not available', 'on call'),
        allowNull: false,
      },
    },
    {
      tableName: 'drivers',
      timestamps: false,
    },
  );

  return Driver;
};
