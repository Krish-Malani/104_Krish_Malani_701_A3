import React, { useState } from 'react';

export default function Login({ onLoginSuccess }) {
  const [empid, setEmpid] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ empid, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to login');
      }

      localStorage.setItem('employee_token', data.token);
      localStorage.setItem('employee_user', JSON.stringify(data.employee));

      onLoginSuccess(data.employee);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Employee Portal - Login</h1>
      <p>Please enter your Employee ID and password received from the ERP admin.</p>

      {error && (
        <p style={{ color: 'red' }}>
          <strong>Error: </strong> {error}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <label htmlFor="empid">Employee ID : </label>
        <input
          type="text"
          id="empid"
          placeholder="e.g. EMP-1001"
          value={empid}
          onChange={(e) => setEmpid(e.target.value)}
          required
        />
        <br /><br />

        <label htmlFor="password">Password : </label>
        <input
          type="password"
          id="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br /><br />

        <input
          type="submit"
          value={loading ? 'Logging in...' : 'Login with JWT'}
          disabled={loading}
        />
      </form>
    </div>
  );
}
