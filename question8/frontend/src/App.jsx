import React, { useState, useEffect } from 'react';

export default function App() {
  const [students, setStudents] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [rollNo, setRollNo] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [course, setCourse] = useState('M.Sc IT');
  const [semester, setSemester] = useState('1');
  const [gender, setGender] = useState('Male');
  const [marks, setMarks] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/students');
      const data = await res.json();
      if (res.ok) {
        setStudents(data);
      } else {
        throw new Error(data.error || 'Failed to fetch students.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setRollNo('');
    setName('');
    setEmail('');
    setCourse('M.Sc IT');
    setSemester('1');
    setGender('Male');
    setMarks('');
  };

  const handleEdit = (student) => {
    setEditingId(student.id);
    setRollNo(student.rollNo);
    setName(student.name);
    setEmail(student.email);
    setCourse(student.course);
    setSemester(student.semester.toString());
    setGender(student.gender);
    setMarks(student.marks.toString());
    setMessage('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, studentName) => {
    if (!window.confirm(`Are you sure you want to delete student: ${studentName}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Delete failed.');

      setMessage(data.message || 'Student deleted successfully.');
      setError('');
      fetchStudents();

      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const payload = {
      rollNo,
      name,
      email,
      course,
      semester: parseInt(semester, 10),
      gender,
      marks: parseFloat(marks) || 0.0
    };

    try {
      let res;
      if (editingId) {
        res = await fetch(`/api/students/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Operation failed.');

      setMessage(data.message || (editingId ? 'Student updated successfully!' : 'Student added successfully!'));
      resetForm();
      fetchStudents();
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Student Management System</h1>
      <p>CRUD operations for Student entity using <strong>Express + Sequelize (ORM) + React</strong>.</p>

      <hr />

      {message && <p style={{ color: 'green' }}><strong>Notice: </strong>{message}</p>}
      {error && <p style={{ color: 'red' }}><strong>Error: </strong>{error}</p>}

      <div style={{ background: '#f9f9f9', padding: '15px', border: '1px solid #ddd', maxWidth: '650px', marginBottom: '25px' }}>
        <h3>{editingId ? `Edit Student (ID: ${editingId})` : 'Add New Student'}</h3>

        <form onSubmit={handleSubmit}>
          <label htmlFor="rollNo">Roll Number : </label>
          <input
            type="text"
            id="rollNo"
            placeholder="e.g. 24MSCIT005"
            value={rollNo}
            onChange={(e) => setRollNo(e.target.value)}
            required
            style={{ width: '220px' }}
          />
          <br /><br />

          <label htmlFor="name">Full Name : </label>
          <input
            type="text"
            id="name"
            placeholder="e.g. Rahul Sharma"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: '260px' }}
          />
          <br /><br />

          <label htmlFor="email">Email Address : </label>
          <input
            type="email"
            id="email"
            placeholder="e.g. rahul@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '260px' }}
          />
          <br /><br />

          <label htmlFor="course">Course : </label>
          <select id="course" value={course} onChange={(e) => setCourse(e.target.value)}>
            <option value="M.Sc IT">M.Sc IT</option>
            <option value="MCA">MCA</option>
            <option value="B.Tech CS">B.Tech CS</option>
            <option value="BCA">BCA</option>
            <option value="Data Science">Data Science</option>
          </select>

          &nbsp;&nbsp;&nbsp;&nbsp;

          <label htmlFor="semester">Semester : </label>
          <select id="semester" value={semester} onChange={(e) => setSemester(e.target.value)}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <option key={sem} value={sem}>{sem}</option>
            ))}
          </select>
          <br /><br />

          <label>Gender : </label>
          <label>
            <input
              type="radio"
              name="gender"
              value="Male"
              checked={gender === 'Male'}
              onChange={(e) => setGender(e.target.value)}
            />
            Male
          </label>
          &nbsp;&nbsp;
          <label>
            <input
              type="radio"
              name="gender"
              value="Female"
              checked={gender === 'Female'}
              onChange={(e) => setGender(e.target.value)}
            />
            Female
          </label>
          &nbsp;&nbsp;
          <label>
            <input
              type="radio"
              name="gender"
              value="Other"
              checked={gender === 'Other'}
              onChange={(e) => setGender(e.target.value)}
            />
            Other
          </label>
          <br /><br />

          <label htmlFor="marks">Marks / Percentage (%) : </label>
          <input
            type="number"
            id="marks"
            step="0.01"
            min="0"
            max="100"
            placeholder="e.g. 85.5"
            value={marks}
            onChange={(e) => setMarks(e.target.value)}
            required
            style={{ width: '120px' }}
          />
          <br /><br />

          <button type="submit" style={{ padding: '8px 16px', fontWeight: 'bold' }}>
            {editingId ? 'Update Student' : '+ Add Student'}
          </button>
          {editingId && (
            <>
              &nbsp;&nbsp;
              <button type="button" onClick={resetForm}>Cancel Edit</button>
            </>
          )}
        </form>
      </div>

      <hr />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3>Students List ({filteredStudents.length} of {students.length})</h3>
        <div>
          <label htmlFor="search">Search: </label>
          <input
            type="text"
            id="search"
            placeholder="Search by name, roll no, course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '4px 8px', width: '250px' }}
          />
        </div>
      </div>

      {loading ? (
        <p>Loading students from database...</p>
      ) : filteredStudents.length === 0 ? (
        <p>No student records found.</p>
      ) : (
        <table border="1" cellPadding="8" cellSpacing="0" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Roll No</th>
              <th>Name</th>
              <th>Email</th>
              <th>Course</th>
              <th>Semester</th>
              <th>Gender</th>
              <th>Marks (%)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((st) => (
              <tr key={st.id} style={{ backgroundColor: editingId === st.id ? '#fff3cd' : 'transparent' }}>
                <td>{st.id}</td>
                <td><strong>{st.rollNo}</strong></td>
                <td>{st.name}</td>
                <td>{st.email}</td>
                <td>{st.course}</td>
                <td style={{ textAlign: 'center' }}>Sem {st.semester}</td>
                <td>{st.gender}</td>
                <td><strong>{st.marks}%</strong></td>
                <td>
                  <button type="button" onClick={() => handleEdit(st)}>Edit</button>
                  &nbsp;|&nbsp;
                  <button type="button" style={{ color: 'red' }} onClick={() => handleDelete(st.id, st.name)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
