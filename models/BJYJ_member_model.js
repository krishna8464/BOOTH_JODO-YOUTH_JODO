const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { Vender } = require('./vendermodel');

const BJYJMEMBER = sequelize.define('BJYJ_MEMBER_TABLE', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  yuva_user_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  state_code: {
    type: DataTypes.CHAR,
    allowNull: false,
  },
  age: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  year: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  parliament_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  parliament_code: {
    type: DataTypes.CHAR,
    allowNull: true,
  },
  assembly_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  assembly_code: {
    type: DataTypes.CHAR,
    allowNull: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  mobile: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  designation: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  ward: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  booth: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  reception: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  frontal: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  report_type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  created_on: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  dob: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  epic: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  caste: {
    type: DataTypes.CHAR,
    allowNull: true,
  },
  gender: {
    type: DataTypes.CHAR,
    allowNull: true,
  },
  photo_path: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  referred_by: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  ac_code: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  district_code: {
    type: DataTypes.CHAR,
    allowNull: true,
  },
  booth_code: {
    type: DataTypes.CHAR,
    allowNull: true,
  },
  user_id: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  VENDER_ID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue : 0,
    references: {
        model: Vender,
        key: 'ID',
    },
  },
  VENDER_STATUS: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue : "VERIFICATION_PENDING"
  },
  VENDER_REASON: {
    type: DataTypes.STRING,
    allowNull: false, 
    defaultValue: '', 
  },
}, {
  tableName: 'BJYJ_MEMBER_TABLE',
  timestamps: false, // If you don't want createdAt and updatedAt columns
  charset: 'utf8mb3',
  collate: 'utf8mb3_general_ci',
  indexes: [
    { fields: ['VENDER_ID'] },
    { fields: ['VENDER_STATUS'] },
    { fields: ['yuva_user_id'] },
    { fields: ['name'] },
    { fields: ['mobile'] },
    { fields: ['state_code'] },
  ],
});

// Define foreign key relationship
BJYJMEMBER.belongsTo(Vender, { foreignKey: 'VENDER_ID', onDelete: 'NO ACTION' });

sequelize.sync()
.then(() => {
    console.log("BJYJ_MEMBER_TABLE table Synced successfully")
})
.catch(() => {
    console.log("Failed to Sync BJYJ_MEMBER_TABLE table")
})

module.exports = { BJYJMEMBER };
