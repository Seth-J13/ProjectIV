export function defineImage(sequelize, Sequelize, name, tableName, parentField, parentType) {
  return sequelize.define(
    name,
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      image: {
        type: Sequelize.BLOB("medium"),
        allowNull: false,
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      [parentField]: {
        type: parentType,
        allowNull: false,
      },
    },
    {
      tableName,
      timestamps: false,
    }
  );
}
