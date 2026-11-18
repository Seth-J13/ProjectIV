export default (sequelize, Sequelize) => {
  const Vehicle = sequelize.define(
    "vehicle",
    {
      vin: {
        // Spec sample and UI use a 17-digit VIN string; INTEGER cannot hold that safely.
        type: Sequelize.STRING(17),
        primaryKey: true,
        allowNull: false,
      },
      make: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      model: {
        type: Sequelize.STRING(65),
        allowNull: false,
      },
      year: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      purchased_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      color: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      license_plate_num: {
        type: Sequelize.STRING(8),
        allowNull: true,
        unique: true,
      },
      tag_exp_month: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      area_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      most_recent_dest_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      available: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      mileage: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "vehicles",
      timestamps: false,
    }
  );

  return Vehicle;
};
