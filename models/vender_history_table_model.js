const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const moment = require('moment-timezone');
const { Vender } = require('./vendermodel');

const VenderHistory = sequelize.define('VENDER_HISTORY_TABLE', {
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
    },
    allowNull: false,
  },
  STATE_CODE: {
    type: DataTypes.CHAR,
    allowNull: false,
  },
  ADMIN_ID: {
    type: DataTypes.INTEGER,
    references: {
      model: Vender,
      key: 'ID',
    },
    allowNull: false,
  },
  ACTION_TYPE: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ACTION_INFO: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  CREATED_ON: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: moment().tz('Asia/Kolkata').format('YYYY-MM-DD hh:mm:ss a'),
  },
  UPDATED_ON: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: moment().tz('Asia/Kolkata').format('YYYY-MM-DD hh:mm:ss a'),
  },
},
{
    tableName: 'VENDER_HISTORY_TABLE',
    timestamps: true,
    charset: 'utf8mb3',
    collate: 'utf8mb3_general_ci',
    indexes: [
        { fields: ['VENDER_ID'] },
        { fields: ['STATE_CODE'] },
      ],
  });

// Define foreign key relationships
VenderHistory.belongsTo(Vender, { foreignKey: 'VENDER_ID' , onDelete: 'NO ACTION' });
VenderHistory.belongsTo(Vender, { foreignKey: 'ADMIN_ID', as: 'Admin' , onDelete: 'NO ACTION' });

sequelize.sync()
  .then(() => {
    console.log('VenderHistory table Synced successfully');
  })
  .catch(() => {
    console.log('Failed to sync VenderHistory table');
  });

module.exports = { VenderHistory };
