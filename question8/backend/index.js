require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');
const Student = require('./models/Student');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

async function initDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Sequelize connected to SQLite database successfully!');

    await sequelize.sync();

    const count = await Student.count();
    if (count === 0) {
      console.log('Seeding initial student records...');
      await Student.bulkCreate([
        {
          rollNo: '24MSCIT001',
          name: 'Aarav Sharma',
          email: 'aarav.sharma@example.com',
          course: 'M.Sc IT',
          semester: 1,
          gender: 'Male',
          marks: 88.5
        },
        {
          rollNo: '24MSCIT002',
          name: 'Priya Patel',
          email: 'priya.patel@example.com',
          course: 'M.Sc IT',
          semester: 1,
          gender: 'Female',
          marks: 92.0
        },
        {
          rollNo: '24MSCIT003',
          name: 'Rohan Mehta',
          email: 'rohan.mehta@example.com',
          course: 'M.Sc IT',
          semester: 1,
          gender: 'Male',
          marks: 79.5
        }
      ]);
      console.log('Sample student records seeded successfully!');
    }
  } catch (err) {
    console.error('Database connection/sync error:', err);
  }
}

initDatabase();

app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.findAll({
      order: [['id', 'DESC']]
    });
    res.json(students);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ error: 'Failed to fetch students: ' + err.message });
  }
});

app.get('/api/students/:id', async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found.' });
    }
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/students', async (req, res) => {
  const { rollNo, name, email, course, semester, gender, marks } = req.body;

  if (!rollNo || !name || !email) {
    return res.status(400).json({ error: 'Roll No, Name, and Email are required.' });
  }

  try {
    const existing = await Student.findOne({ where: { rollNo: rollNo.trim() } });
    if (existing) {
      return res.status(400).json({ error: `Roll No '${rollNo}' is already registered.` });
    }

    const newStudent = await Student.create({
      rollNo: rollNo.trim(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      course: course || 'M.Sc IT',
      semester: parseInt(semester, 10) || 1,
      gender: gender || 'Male',
      marks: parseFloat(marks) || 0.0
    });

    res.status(201).json({
      message: 'Student added successfully!',
      student: newStudent
    });
  } catch (err) {
    console.error('Error adding student:', err);
    res.status(500).json({ error: 'Failed to add student: ' + err.message });
  }
});

app.put('/api/students/:id', async (req, res) => {
  const { rollNo, name, email, course, semester, gender, marks } = req.body;

  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    if (rollNo && rollNo.trim() !== student.rollNo) {
      const duplicate = await Student.findOne({ where: { rollNo: rollNo.trim() } });
      if (duplicate) {
        return res.status(400).json({ error: `Roll No '${rollNo}' is already taken by another student.` });
      }
      student.rollNo = rollNo.trim();
    }

    if (name) student.name = name.trim();
    if (email) student.email = email.trim().toLowerCase();
    if (course) student.course = course;
    if (semester !== undefined) student.semester = parseInt(semester, 10);
    if (gender) student.gender = gender;
    if (marks !== undefined) student.marks = parseFloat(marks);

    await student.save();

    res.json({
      message: 'Student updated successfully!',
      student
    });
  } catch (err) {
    console.error('Error updating student:', err);
    res.status(500).json({ error: 'Failed to update student: ' + err.message });
  }
});

app.delete('/api/students/:id', async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    await student.destroy();
    res.json({ message: `Student '${student.name}' (${student.rollNo}) deleted successfully.` });
  } catch (err) {
    console.error('Error deleting student:', err);
    res.status(500).json({ error: 'Failed to delete student: ' + err.message });
  }
});

app.listen(PORT, (err) => {
  if (err) {
    console.error('Failed to start Question 8 backend:', err);
  } else {
    console.log(`Question 8 Sequelize Server running at http://localhost:${PORT}`);
  }
});
