import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Profile from './components/Profile';
import LeaveApplication from './components/LeaveApplication';

export default function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('profile');

  useEffect(() => {
    const savedUser = localStorage.getItem('employee_user');
    const token = localStorage.getItem('employee_token');
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        setUser(null);
      }
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setCurrentPage('profile');
  };

  const handleLogout = () => {
    localStorage.removeItem('employee_token');
    localStorage.removeItem('employee_user');
    setUser(null);
  };

  if (!user) {
    return (
      <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
        <Login onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Employee Home Page (ERP System)</h1>
      <p>
        Logged in as: <strong>{user.name}</strong> ({user.empid}) | Department: {user.department}
      </p>

      <p style={{ fontSize: '1.05rem' }}>
        <a
          href="#profile"
          onClick={(e) => {
            e.preventDefault();
            setCurrentPage('profile');
          }}
          style={{
            fontWeight: currentPage === 'profile' ? 'bold' : 'normal',
            textDecoration: currentPage === 'profile' ? 'underline' : 'none'
          }}
        >
          Page 1: Employee Profile
        </a>
        {' | '}
        <a
          href="#leave"
          onClick={(e) => {
            e.preventDefault();
            setCurrentPage('leave');
          }}
          style={{
            fontWeight: currentPage === 'leave' ? 'bold' : 'normal',
            textDecoration: currentPage === 'leave' ? 'underline' : 'none'
          }}
        >
          Page 2: Application for Leave (Add / List)
        </a>
        {' | '}
        <a
          href="#logout"
          onClick={(e) => {
            e.preventDefault();
            handleLogout();
          }}
          style={{ color: 'red' }}
        >
          Logout
        </a>
      </p>

      <hr />

      {currentPage === 'profile' && <Profile />}
      {currentPage === 'leave' && <LeaveApplication />}
    </div>
  );
}
