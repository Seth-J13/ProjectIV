export default (sequelize, Sequelize) => {
  const Contributor = sequelize.define(
    "contributor",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      note_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      contributor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      created_note: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    },
    {
      tableName: "contributors",
      timestamps: false,
    }
  );

  return Contributor;
};
