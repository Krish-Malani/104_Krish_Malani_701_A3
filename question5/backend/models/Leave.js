const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  empid: {
    type: String,
    required: true
  },
  employeeName: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  grant: {
    type: String,
    enum: ['Yes', 'No'],
    default: 'No'
  },
  appliedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Leave', leaveSchema);
