const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: process.env.DB_DIALECT || 'sqlite',
  storage: path.join(__dirname, '..', process.env.DB_STORAGE || 'database.sqlite'),
  logging: false
});

module.exports = sequelize;
