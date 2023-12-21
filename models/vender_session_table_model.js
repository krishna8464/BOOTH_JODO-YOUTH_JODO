const { DataTypes } = require('sequelize');
const moment = require('moment-timezone');
const { sequelize } = require('../config/db');
const { Vender } = require('./vendermodel'); // Import the Vender model

const VenderSession = sequelize.define('VENDER_SESSION_TABLE',{
    ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    VENDER_ID: {
      type: DataTypes.INTEGER,
      references: {
        model: Vender,
        key: 'ID',
        onDelete: 'NO ACTION',
      },
      allowNull: false,
    },
    TOKEN: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    STATUS: {
      type: DataTypes.STRING,
      defaultValue: 'ACTIVE',
    },
    LOGIN_TIME: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: moment().tz('Asia/Kolkata').format('YYYY-MM-DD hh:mm:ss a'),
    },
    LOGOUT_TIME: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    IP_ADDRESS: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    LONGITUDE: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    LATITUDE: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: 'VENDER_SESSION_TABLE',
    timestamps: false,
    charset: 'utf8mb3',
    collate: 'utf8mb3_general_ci',
    indexes: [
        { fields: ['VENDER_ID'] },
        { fields: ['TOKEN'] },
      ],
  }
);

// Define the foreign key relationship
VenderSession.belongsTo(Vender, { foreignKey: 'VENDER_ID' , onDelete: 'NO ACTION', });



sequelize.sync()
  .then(() => {
    console.log('VenderSession table Synced successfully');
  })
  .catch(() => {
    console.log('Failed to sync VenderSession table');
  });

module.exports = { VenderSession };
