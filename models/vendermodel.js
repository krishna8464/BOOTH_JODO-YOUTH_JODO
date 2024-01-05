const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const moment = require('moment-timezone');

const Vender = sequelize.define("VENDER_TABLE", {
  ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  FIRST_NAME: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  LAST_NAME: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  MOBILE: {
    type: DataTypes.STRING,
    unique : true,
    allowNull: false,
  },
  EMAIL: {
    type: DataTypes.STRING,
    unique : true ,
    allowNull: false,
  },
  PHOTO_LINK: {
    type: DataTypes.STRING,
    allowNull: true, // Adjust as needed
  },
  HOME_STATE_NAME: {
    type: DataTypes.STRING,
    allowNull: true, // Adjust as needed
  },
  HOME_STATE_CODE: {
    type: DataTypes.CHAR,
    allowNull: true, // Adjust as needed
  },
  STATUS: {
    type: DataTypes.STRING,
    defaultValue: 'ACTIVE',
  },
  ROLE: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  LOGIN_STATUS: {
    type: DataTypes.STRING,
    defaultValue: 'OFFLINE',
  },
  CURRENT_IP: {
    type: DataTypes.STRING,
    allowNull: true, // Adjust as needed
  },
  PINCODE: {
    type: DataTypes.STRING,
    allowNull: true, // Adjust as needed
  },
  HOME_ADDRESS: {
    type: DataTypes.STRING,
    allowNull: true, // Adjust as needed
  },
  ASSIGN_STATE_CODE: {
    type: DataTypes.CHAR,
    allowNull: false, // Adjust as needed
  },
  CREATED_ON: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue:  moment().tz('Asia/Kolkata').format('YYYY-MM-DD hh:mm:ss a'),
  },
  UPDATED_ON: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue:  moment().tz('Asia/Kolkata').format('YYYY-MM-DD hh:mm:ss a'),
  },
},
{
    tableName: 'VENDER_TABLE',
    timestamps: true,
    charset: 'utf8mb3',
    collate: 'utf8mb3_general_ci',
    indexes: [
        { fields: ['MOBILE'] },
        { fields: ['EMAIL'] },
        { fields : ['ASSIGN_STATE_CODE']},
      ],
  });



sequelize.sync()
  .then(() => {
    console.log("Vender table Synced successfully");
  })
  .catch(() => {
    console.log("Failed to sync Vender table");
  });

module.exports = { Vender };
