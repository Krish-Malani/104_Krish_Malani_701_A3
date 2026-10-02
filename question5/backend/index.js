require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const Employee = require('./models/Employee');
const Leave = require('./models/Leave');
const authMiddleware = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_employee_jwt_token_key_12345';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/erp_system';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Question 5 Backend connected to MongoDB (erp_system)!');
  })
  .catch((err) => {
    console.error('MongoDB Connection Error:', err.message);
  });

app.post('/api/login', async (req, res) => {
  const { empid, password } = req.body;

  if (!empid || !password) {
    return res.status(400).json({ error: 'Please enter both Employee ID and Password.' });
  }

  try {
    const employee = await Employee.findOne({
      $or: [
        { empid: empid.trim() },
        { email: empid.trim().toLowerCase() }
      ]
    });

    if (!employee) {
      return res.status(401).json({ error: 'Employee not found. Please check your Employee ID.' });
    }

    const isPasswordValid = await bcrypt.compare(password, employee.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password. Please try again.' });
    }

    const token = jwt.sign(
      {
        id: employee._id,
        empid: employee.empid,
        name: employee.name
      },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful!',
      token: token,
      employee: {
        id: employee._id,
        empid: employee.empid,
        name: employee.name,
        email: employee.email,
        department: employee.department,
        designation: employee.designation
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

app.get('/api/profile', authMiddleware, async (req, res) => {
  try {
    const employee = await Employee.findById(req.user.id).select('-password');
    if (!employee) {
      return res.status(404).json({ error: 'Employee profile not found.' });
    }
    res.json(employee);
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch employee profile.' });
  }
});

app.post('/api/leaves', authMiddleware, async (req, res) => {
  const { date, reason, grant } = req.body;

  if (!date || !reason) {
    return res.status(400).json({ error: 'Leave date and reason are required.' });
  }

  try {
    const employee = await Employee.findById(req.user.id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    const newLeave = new Leave({
      employeeId: employee._id,
      empid: employee.empid,
      employeeName: employee.name,
      date: date.trim(),
      reason: reason.trim(),
      grant: grant === 'Yes' ? 'Yes' : 'No'
    });

    await newLeave.save();

    res.status(201).json({
      message: 'Leave application submitted successfully!',
      leave: newLeave
    });
  } catch (err) {
    console.error('Leave submission error:', err);
    res.status(500).json({ error: 'Failed to submit leave application.' });
  }
});

app.get('/api/leaves', authMiddleware, async (req, res) => {
  try {
    const leaves = await Leave.find({ employeeId: req.user.id }).sort({ appliedAt: -1 });
    res.json(leaves);
  } catch (err) {
    console.error('Leave listing error:', err);
    res.status(500).json({ error: 'Failed to fetch leave applications.' });
  }
});

app.listen(PORT, (err) => {
  if (err) {
    console.error('Failed to start Question 5 backend:', err);
  } else {
    console.log(`Question 5 Backend API listening at http://localhost:${PORT}`);
  }
});
