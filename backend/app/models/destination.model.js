export default (sequelize, DataTypes) => {
  const Destination = sequelize.define(
    "destination",
    {
      destId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: false },
      name: { type: DataTypes.STRING, allowNull: false },
    },
    { tableName: "destinations", timestamps: false }
  );

  return Destination;
};
