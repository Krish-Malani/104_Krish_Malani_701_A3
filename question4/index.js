require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const path = require('path');

const Employee = require('./models/Employee');
const { sendWelcomeEmail } = require('./utils/emailService');

const app = express();
const PORT = process.env.PORT || 3000;

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/erp_system';
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully!');
  })
  .catch((err) => {
    console.error('MongoDB Connection Error:', err.message);
  });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'erp_admin_secret_key_123',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 2
    }
  })
);

function isAdminAuthenticated(req, res, next) {
  if (req.session && req.session.admin) {
    return next();
  }
  return res.redirect('/login?error=Please login as Admin to access the ERP panel.');
}

async function generateEmpId() {
  const lastEmployee = await Employee.findOne().sort({ createdAt: -1 });
  if (!lastEmployee || !lastEmployee.empid) {
    return 'EMP-1001';
  }

  const match = lastEmployee.empid.match(/EMP-(\d+)/);
  if (match) {
    const nextNumber = parseInt(match[1], 10) + 1;
    return `EMP-${nextNumber}`;
  }

  return `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
}

function generateRandomPassword() {
  return crypto.randomBytes(4).toString('hex');
}

app.get('/', (req, res) => {
  if (req.session && req.session.admin) {
    return res.redirect('/dashboard');
  }
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  if (req.session && req.session.admin) {
    return res.redirect('/dashboard');
  }

  const error = req.query.error || null;
  const message = req.query.msg || null;

  res.render('login', { error, message });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin';

  if (!username || !password) {
    return res.render('login', {
      error: 'Please enter both username and password.',
      message: null
    });
  }

  if (username.trim() === adminUsername && password === adminPassword) {
    req.session.admin = username.trim();
    return res.redirect('/dashboard');
  } else {
    return res.render('login', {
      error: 'Invalid admin credentials. Please try again.',
      message: null
    });
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destruction error:', err);
    }
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
});

app.get('/dashboard', isAdminAuthenticated, async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    const message = req.query.msg || null;
    const error = req.query.error || null;

    res.render('dashboard', {
      admin: req.session.admin,
      employees,
      message,
      error
    });
  } catch (err) {
    console.error('Error fetching employees:', err);
    res.status(500).send('Database error fetching employees list.');
  }
});

app.get('/employees/add', isAdminAuthenticated, (req, res) => {
  res.render('addEmployee', { error: null });
});

app.post('/employees/add', isAdminAuthenticated, async (req, res) => {
  const { name, email, phone, department, designation } = req.body;

  const basicSalary = parseFloat(req.body.basicSalary) || 0;
  const hra = parseFloat(req.body.hra) || 0;
  const da = parseFloat(req.body.da) || 0;
  const deductions = parseFloat(req.body.deductions) || 0;

  if (!name || !email || !department || !designation || basicSalary <= 0) {
    return res.render('addEmployee', {
      error: 'Please fill in all required fields. Basic salary must be greater than 0.'
    });
  }

  try {
    const existing = await Employee.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return res.render('addEmployee', {
        error: `An employee with email '${email}' already exists.`
      });
    }

    const empid = await generateEmpId();
    const rawPassword = generateRandomPassword();

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    const grossSalary = basicSalary + hra + da;
    const netSalary = grossSalary - deductions;

    const newEmployee = new Employee({
      empid,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : '',
      department,
      designation: designation.trim(),
      password: hashedPassword,
      basicSalary,
      hra,
      da,
      deductions,
      grossSalary,
      netSalary
    });

    await newEmployee.save();

    console.log('==================================================');
    console.log('[NEW EMPLOYEE CREATED]');
    console.log(`  Emp ID   : ${empid}`);
    console.log(`  Name     : ${newEmployee.name}`);
    console.log(`  Email    : ${newEmployee.email}`);
    console.log(`  Password : ${rawPassword}`);
    console.log('==================================================');

    const emailResult = await sendWelcomeEmail(newEmployee, rawPassword);

    let successMsg = `Employee ${newEmployee.name} (${empid}) added successfully!`;
    if (emailResult.success) {
      successMsg += ` Welcome email sent to ${newEmployee.email}.`;
    } else {
      successMsg += ` (Notice: Email was not sent because EMAIL credentials in .env are not configured).`;
    }

    res.redirect(`/dashboard?msg=${encodeURIComponent(successMsg)}`);
  } catch (err) {
    console.error('Error saving employee:', err);
    res.render('addEmployee', {
      error: `Failed to create employee: ${err.message}`
    });
  }
});

app.get('/employees/edit/:id', isAdminAuthenticated, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.redirect('/dashboard?error=Employee not found.');
    }
    res.render('editEmployee', { employee, error: null });
  } catch (err) {
    console.error('Error finding employee for edit:', err);
    res.redirect('/dashboard?error=Invalid employee ID.');
  }
});

app.post('/employees/edit/:id', isAdminAuthenticated, async (req, res) => {
  const { name, email, phone, department, designation } = req.body;

  const basicSalary = parseFloat(req.body.basicSalary) || 0;
  const hra = parseFloat(req.body.hra) || 0;
  const da = parseFloat(req.body.da) || 0;
  const deductions = parseFloat(req.body.deductions) || 0;

  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.redirect('/dashboard?error=Employee not found.');
    }

    const grossSalary = basicSalary + hra + da;
    const netSalary = grossSalary - deductions;

    employee.name = name.trim();
    employee.email = email.trim().toLowerCase();
    employee.phone = phone ? phone.trim() : '';
    employee.department = department;
    employee.designation = designation.trim();
    employee.basicSalary = basicSalary;
    employee.hra = hra;
    employee.da = da;
    employee.deductions = deductions;
    employee.grossSalary = grossSalary;
    employee.netSalary = netSalary;

    await employee.save();

    res.redirect(`/dashboard?msg=${encodeURIComponent(`Employee ${employee.empid} updated successfully.`)}`);
  } catch (err) {
    console.error('Error updating employee:', err);
    const employee = await Employee.findById(req.params.id);
    res.render('editEmployee', {
      employee,
      error: `Failed to update employee: ${err.message}`
    });
  }
});

app.get('/employees/delete/:id', isAdminAuthenticated, async (req, res) => {
  try {
    const deletedEmp = await Employee.findByIdAndDelete(req.params.id);
    if (!deletedEmp) {
      return res.redirect('/dashboard?error=Employee not found.');
    }
    res.redirect(`/dashboard?msg=${encodeURIComponent(`Employee ${deletedEmp.name} (${deletedEmp.empid}) deleted successfully.`)}`);
  } catch (err) {
    console.error('Error deleting employee:', err);
    res.redirect('/dashboard?error=Failed to delete employee.');
  }
});

app.listen(PORT, (err) => {
  if (err) {
    console.error('Failed to start server:', err);
  } else {
    console.log(`Question 4 ERP Admin Server running at http://localhost:${PORT}`);
  }
});
