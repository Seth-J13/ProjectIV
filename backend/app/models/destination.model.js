export default (sequelize, Sequelize) => {
  const Destination = sequelize.define(
    "destination",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      zip: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      city: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      state: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      addr_line_1: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      addr_line_2: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      dest_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      last_visited_on: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
    },
    {
      tableName: "Destinations",
      timestamps: true,
    }
  );

  return Destination;
};
