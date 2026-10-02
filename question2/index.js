const express = require('express');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

const sessionsDir = path.join(__dirname, 'sessions');
if (!fs.existsSync(sessionsDir)) {
  fs.mkdirSync(sessionsDir, { recursive: true });
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    store: new FileStore({
      path: sessionsDir,
      ttl: 3600,
      retries: 0
    }),
    secret: 'my_super_secret_session_key_123',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60
    }
  })
);

const users = [
  {
    username: 'admin',
    password: 'admin',
    fullName: 'Admin',
    email: 'admin@example.com',
    role: 'Admin'
  }
];

function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  return res.redirect('/login?error=Please login first to access this page.');
}

function renderLogin(res, messageHtml = '') {
  let html = fs.readFileSync(path.join(__dirname, 'views', 'login.html'), 'utf8');
  html = html.replace('{{message}}', messageHtml);
  res.send(html);
}

app.get('/', (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect('/dashboard');
  }
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect('/dashboard');
  }

  let messageHtml = '';
  if (req.query.error) {
    messageHtml = `<p style="color: red;"><strong>Error:</strong> ${req.query.error}</p>`;
  }

  renderLogin(res, messageHtml);
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    const errorHtml = `<p style="color: red;"><strong>Error:</strong> Both username and password are required.</p>`;
    return renderLogin(res, errorHtml);
  }

  const foundUser = users.find(
    (u) => u.username === username.trim() && u.password === password
  );

  if (foundUser) {
    req.session.user = {
      username: foundUser.username,
      fullName: foundUser.fullName,
      email: foundUser.email,
      role: foundUser.role,
      loginTime: new Date().toLocaleString()
    };
    return res.redirect('/dashboard');
  } else {
    const errorHtml = `<p style="color: red;"><strong>Error:</strong> Invalid username or password. Please try again.</p>`;
    return renderLogin(res, errorHtml);
  }
});

app.get('/dashboard', isAuthenticated, (req, res) => {
  let html = fs.readFileSync(path.join(__dirname, 'views', 'dashboard.html'), 'utf8');
  html = html.replace(/{{fullName}}/g, req.session.user.fullName);

  res.send(html);
});

app.get('/profile', isAuthenticated, (req, res) => {
  let html = fs.readFileSync(path.join(__dirname, 'views', 'profile.html'), 'utf8');
  html = html
    .replace(/{{fullName}}/g, req.session.user.fullName)
    .replace(/{{username}}/g, req.session.user.username)
    .replace(/{{email}}/g, req.session.user.email)
    .replace(/{{role}}/g, req.session.user.role)
    .replace(/{{loginTime}}/g, req.session.user.loginTime);

  res.send(html);
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.redirect('/dashboard');
    }
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
});

app.listen(PORT, (err) => {
  if (err) {
    console.error('Failed to start server:', err);
  } else {
    console.log(`Question 2 server running at http://localhost:${PORT}`);
  }
});
