const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  empid: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    default: ''
  },
  department: {
    type: String,
    required: true
  },
  designation: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  basicSalary: {
    type: Number,
    required: true,
    default: 0
  },
  hra: {
    type: Number,
    default: 0
  },
  da: {
    type: Number,
    default: 0
  },
  deductions: {
    type: Number,
    default: 0
  },
  grossSalary: {
    type: Number,
    default: 0
  },
  netSalary: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Employee', employeeSchema);
