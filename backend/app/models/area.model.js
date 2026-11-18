export default (sequelize, DataTypes) => {
  const Area = sequelize.define(
    "area",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true,
      },
      logo: {
        type: DataTypes.BLOB,
        allowNull: true,
      },
      noticeEmail: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
    },
    {
      tableName: "areas",
      timestamps: false,
    }
  );

  return Area;
};
