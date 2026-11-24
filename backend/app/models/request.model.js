export default (sequelize, Sequelize) => {
  const Request = sequelize.define(
    'request',
    {
      requestId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "request_id",
      },
      requestType: {
        type: Sequelize.ENUM('trip', 'maintenance'),
        allowNull: false,
      },
      requesterId: { type: Sequelize.INTEGER, allowNull: false, field: "requester_id" },
      vehicleId: { type: Sequelize.STRING(17), allowNull: false, field: "vehicle_id" },
      driverId: { type: Sequelize.INTEGER, allowNull: true },
      destId: { type: Sequelize.INTEGER, allowNull: true },
      startDate: { type: Sequelize.STRING, allowNull: true },
      startTime: { type: Sequelize.STRING, allowNull: true },
      endDate: { type: Sequelize.STRING, allowNull: true },
      endTime: { type: Sequelize.STRING, allowNull: true },
      numPeople: { type: Sequelize.INTEGER, allowNull: true },
      currentlyActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    { tableName: 'requests', timestamps: false },
  );

  return Request;
};
