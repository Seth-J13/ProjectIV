export default (sequelize, Sequelize) => {
  const Note = sequelize.define(
    "note",
    {
      note_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id",
      },
      subject: {
        type: Sequelize.STRING(255),
        allowNull: false,
        field: "reason",
      },
      text: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      maintenance_request: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      request_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
    },
    {
      tableName: "notes",
      timestamps: false,
    }
  );

  return Note;
};
