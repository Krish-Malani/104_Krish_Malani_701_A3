import React, { useState, useEffect } from 'react';

export default function LeaveApplication() {
  const [leaves, setLeaves] = useState([]);
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');
  const [grant, setGrant] = useState('No');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    const token = localStorage.getItem('employee_token');
    if (!token) return;

    try {
      const response = await fetch('/api/leaves', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setLeaves(data);
      }
    } catch (err) {
      console.error('Error fetching leaves:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    const token = localStorage.getItem('employee_token');

    try {
      const response = await fetch('/api/leaves', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ date, reason, grant })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit leave application.');
      }

      setMessage('Leave application submitted successfully!');
      setDate('');
      setReason('');
      setGrant('No');
      fetchLeaves();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2>Page 2: Application for Leave</h2>

      {message && <p style={{ color: 'green' }}><strong>Notice: </strong>{message}</p>}
      {error && <p style={{ color: 'red' }}><strong>Error: </strong>{error}</p>}

      <h3>Apply for Leave:</h3>
      <form onSubmit={handleSubmit}>
        <label htmlFor="leaveDate">Date of Leave : </label>
        <input
          type="date"
          id="leaveDate"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <br /><br />

        <label htmlFor="reason">Reason for Leave : </label>
        <input
          type="text"
          id="reason"
          placeholder="e.g. Family function / Medical leave"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
          style={{ width: '280px' }}
        />
        <br /><br />

        <label htmlFor="grant">Grant (Yes / No) : </label>
        <select
          id="grant"
          value={grant}
          onChange={(e) => setGrant(e.target.value)}
        >
          <option value="No">No</option>
          <option value="Yes">Yes</option>
        </select>
        <br /><br />

        <input
          type="submit"
          value={submitting ? 'Submitting...' : 'Apply for Leave'}
          disabled={submitting}
        />
      </form>

      <hr />

      <h3>Your Leave Applications List:</h3>
      {leaves.length === 0 ? (
        <p>No leave applications submitted yet.</p>
      ) : (
        <table border="1" cellPadding="8" cellSpacing="0">
          <thead>
            <tr>
              <th>Date of Leave</th>
              <th>Reason</th>
              <th>Grant (Yes/No)</th>
              <th>Applied On</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map((leave) => (
              <tr key={leave._id}>
                <td>{leave.date}</td>
                <td>{leave.reason}</td>
                <td>
                  <strong>{leave.grant}</strong>
                </td>
                <td>{new Date(leave.appliedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
