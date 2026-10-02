const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  rollNo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  course: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'M.Sc IT'
  },
  semester: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Male'
  },
  marks: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.0
  }
}, {
  timestamps: true,
  tableName: 'students'
});

module.exports = Student;
