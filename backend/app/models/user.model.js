export default (sequelize, Sequelize) => {
  const User = sequelize.define(
    "user",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      role: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      googleSub: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
    },
    {
      tableName: "users",
      timestamps: false,
      defaultScope: {
        attributes: { exclude: ["password", "googleSub"] },
      },
    }
  );

  return User;
};
