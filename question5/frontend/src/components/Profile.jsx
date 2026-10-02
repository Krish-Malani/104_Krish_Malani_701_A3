import React, { useState, useEffect } from 'react';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem('employee_token');
    if (!token) {
      setError('No authorization token found. Please login again.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch profile.');
      }

      setProfile(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p>Loading employee profile...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}><strong>Error:</strong> {error}</p>;
  }

  if (!profile) {
    return <p>No profile data available.</p>;
  }

  return (
    <div>
      <h2>Page 1: Employee Profile</h2>
      <p>Here are your employee account details and salary breakdown:</p>

      <table border="1" cellPadding="8" cellSpacing="0">
        <tbody>
          <tr>
            <th>Field</th>
            <th>Information</th>
          </tr>
          <tr>
            <td><strong>Employee ID</strong></td>
            <td><strong>{profile.empid}</strong></td>
          </tr>
          <tr>
            <td><strong>Full Name</strong></td>
            <td>{profile.name}</td>
          </tr>
          <tr>
            <td><strong>Email Address</strong></td>
            <td>{profile.email}</td>
          </tr>
          <tr>
            <td><strong>Phone</strong></td>
            <td>{profile.phone || 'N/A'}</td>
          </tr>
          <tr>
            <td><strong>Department</strong></td>
            <td>{profile.department}</td>
          </tr>
          <tr>
            <td><strong>Designation</strong></td>
            <td>{profile.designation}</td>
          </tr>
        </tbody>
      </table>

      <h3>Salary Details:</h3>
      <table border="1" cellPadding="8" cellSpacing="0">
        <tbody>
          <tr>
            <th>Salary Component</th>
            <th>Amount (₹)</th>
          </tr>
          <tr>
            <td>Basic Salary</td>
            <td>{Number(profile.basicSalary || 0).toFixed(2)}</td>
          </tr>
          <tr>
            <td>HRA (House Rent Allowance)</td>
            <td>{Number(profile.hra || 0).toFixed(2)}</td>
          </tr>
          <tr>
            <td>DA (Dearness Allowance)</td>
            <td>{Number(profile.da || 0).toFixed(2)}</td>
          </tr>
          <tr>
            <td>Deductions (PF / Tax)</td>
            <td>-{Number(profile.deductions || 0).toFixed(2)}</td>
          </tr>
          <tr>
            <td><strong>Gross Salary</strong></td>
            <td><strong>₹{Number(profile.grossSalary || 0).toFixed(2)}</strong></td>
          </tr>
          <tr>
            <td><strong>Net Take-Home Salary</strong></td>
            <td><strong>₹{Number(profile.netSalary || 0).toFixed(2)}</strong></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
