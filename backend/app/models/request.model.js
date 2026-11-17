export default (sequelize, Sequelize) => {
  const Request = sequelize.define(
    "request",
    {
      request_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      requester_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      vehicle_id: {
        type: Sequelize.STRING(17),
        allowNull: false,
      },
      maintenance: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: "requests",
      timestamps: false,
    }
  );

  return Request;
};
