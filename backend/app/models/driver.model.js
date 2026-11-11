export default (sequelize, DataTypes) => {
  const Driver = sequelize.define(
    "driver",
    {
      driver_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      license_status: {
        type: DataTypes.ENUM("expired", "active", "suspended"),
        allowNull: false,
      },
      license_exp_date: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      availability: {
        type: DataTypes.ENUM("available", "not available", "on call"),
        allowNull: false,
      },
    },
    {
      tableName: "drivers",
      timestamps: false,
    }
  );

  return Driver;
};
