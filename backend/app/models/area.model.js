export default (sequelize, Sequelize) => {
  const Area = sequelize.define(
    'area',
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING(30),
        allowNull: false,
        unique: true,
      },
      logo: {
        type: Sequelize.BLOB("medium"),
        allowNull: true,
      },
      noticeEmail: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
    },
    {
      tableName: 'areas',
      timestamps: false,
    },
  );

  return Area;
};
