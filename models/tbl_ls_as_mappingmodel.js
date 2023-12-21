const DataTypes = require("sequelize");
const { sequelize } = require("../config/db");

const LsAsMapping = sequelize.define("ls_as_mapping",{
      ID:{
          type:DataTypes.INTEGER,
          primaryKey:true,
          autoIncrement:true
      },
      STATE_CODE: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      LS_CODE: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      LS_NAME: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      AS_CODE: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      AS_NAME: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      
},
{

    tableName: 'ls_as_mapping',
    timestamps: false,
    charset: 'utf8mb3',
    collate: 'utf8mb3_general_ci',
    indexes: [
        { fields: ['STATE_CODE'] },
        { fields: ['LS_CODE'] },
        { fields: ['AS_CODE'] },
        ],
}
);
sequelize.sync()
.then(() => {
    console.log("ls_as_mapping table Synced successfully")
})
.catch(() => {
    console.log("Failed to Sync ls_as_mapping table")
})

module.exports={LsAsMapping}