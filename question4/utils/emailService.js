const nodemailer = require('nodemailer');

function getTransporter() {
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.EMAIL_PORT, 10) || 587;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass || user === 'your_email@gmail.com') {
    return null;
  }

  return nodemailer.createTransport({
    host: host,
    port: port,
    secure: port === 465,
    auth: {
      user: user,
      pass: pass
    }
  });
}

async function sendWelcomeEmail(employee, rawPassword) {
  const transporter = getTransporter();

  if (!transporter) {
    console.log(`[Email Service Notice]: Email not sent to ${employee.email} because EMAIL_USER/EMAIL_PASS are placeholders in .env.`);
    return { success: false, message: 'Email credentials not configured in .env' };
  }

  const mailOptions = {
    from: `"ERP Admin Panel" <${process.env.EMAIL_USER}>`,
    to: employee.email,
    subject: `Welcome to ERP System - Your Account Details (${employee.empid})`,
    html: `
      <h2>Welcome to the Organization, ${employee.name}!</h2>
      <p>Your employee profile has been created successfully in our ERP system.</p>
      
      <h3>Your Login Credentials:</h3>
      <ul>
        <li><strong>Employee ID (empid):</strong> ${employee.empid}</li>
        <li><strong>Temporary Password:</strong> ${rawPassword}</li>
      </ul>
      <p><em>(Please change your password after your initial login for security.)</em></p>

      <h3>Your Salary Details:</h3>
      <table border="1" cellpadding="6" cellspacing="0">
        <tr><th>Component</th><th>Amount (₹)</th></tr>
        <tr><td>Basic Salary</td><td>${employee.basicSalary.toFixed(2)}</td></tr>
        <tr><td>HRA (House Rent Allowance)</td><td>${employee.hra.toFixed(2)}</td></tr>
        <tr><td>DA (Dearness Allowance)</td><td>${employee.da.toFixed(2)}</td></tr>
        <tr><td><strong>Gross Salary</strong></td><td><strong>${employee.grossSalary.toFixed(2)}</strong></td></tr>
        <tr><td>Deductions (PF / Tax)</td><td>-${employee.deductions.toFixed(2)}</td></tr>
        <tr style="background-color: #f2f2f2;"><td><strong>Net Take-Home Salary</strong></td><td><strong>₹${employee.netSalary.toFixed(2)}</strong></td></tr>
      </table>

      <br>
      <p>Best Regards,<br><strong>ERP HR & Administration Team</strong></p>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service]: Welcome email sent to ${employee.email}. Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Email Service Error]: Failed to send email to ${employee.email}:`, error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendWelcomeEmail
};
