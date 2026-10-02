const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { check, validationResult } = require('express-validator');

const app = express();
const PORT = 3000;

const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const sanitizedBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, '_');
    const uniqueFilename = `${file.fieldname}-${Date.now()}-${sanitizedBase}${ext}`;
    cb(null, uniqueFilename);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|webp|gif/i;
  const ext = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedExtensions.test(file.mimetype);

  if (ext && mimetype) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type in '${file.fieldname}'. Only JPG, JPEG, PNG, WEBP, and GIF images are allowed.`));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter
});

const handleUpload = (req, res, next) => {
  const uploadFields = upload.fields([
    { name: 'propic', maxCount: 1 },
    { name: 'otherpic', maxCount: 10 }
  ]);

  uploadFields(req, res, (err) => {
    if (err) {
      req.uploadError = err.message;
    }
    next();
  });
};

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const registrationValidationRules = [
  check('username')
    .trim()
    .notEmpty().withMessage('Username is required.')
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long.'),

  check('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),

  check('confirmpwd')
    .notEmpty().withMessage('Confirm password is required.')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Confirm password does not match password.');
      }
      return true;
    }),

  check('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please provide a valid email address.'),

  check('gender')
    .notEmpty().withMessage('Please select your gender.'),

  check('hobbies')
    .custom((value) => {
      if (!value || (Array.isArray(value) && value.length === 0)) {
        throw new Error('Please select at least one hobby.');
      }
      return true;
    })
];

const cleanupFiles = (files) => {
  if (!files) return;
  Object.keys(files).forEach((key) => {
    files[key].forEach((file) => {
      if (file.path && fs.existsSync(file.path)) {
        try {
          fs.unlinkSync(file.path);
        } catch (cleanupErr) {
          console.error('Error removing file during cleanup:', cleanupErr);
        }
      }
    });
  });
};

app.get('/', (req, res) => {
  res.render('registrationForm', {
    errors: {},
    oldData: {}
  });
});

app.post('/register', handleUpload, registrationValidationRules, (req, res) => {
  const result = validationResult(req);
  let errors = {};

  if (!result.isEmpty()) {
    result.array().forEach((err) => {
      if (!errors[err.path]) {
        errors[err.path] = { msg: err.msg };
      }
    });
  }

  if (req.uploadError) {
    errors['fileUpload'] = { msg: req.uploadError };
  }

  if (!req.files || !req.files['propic'] || req.files['propic'].length === 0) {
    errors['propic'] = { msg: 'Profile picture is required.' };
  }

  if (Object.keys(errors).length > 0) {
    cleanupFiles(req.files);
    return res.status(422).render('registrationForm', {
      errors: errors,
      oldData: req.body
    });
  }

  const userData = {
    username: req.body.username,
    email: req.body.email,
    gender: req.body.gender,
    hobbies: Array.isArray(req.body.hobbies) ? req.body.hobbies : [req.body.hobbies],
    propic: req.files['propic'][0],
    otherpics: req.files['otherpic'] || []
  };

  res.render('display', { user: userData });
});

app.get('/download/:filename', (req, res) => {
  const filename = path.basename(req.params.filename);
  const filePath = path.join(uploadDir, filename);

  if (fs.existsSync(filePath)) {
    const originalName = req.query.original || filename;
    res.download(filePath, originalName, (err) => {
      if (err) {
        console.error('Download error:', err);
        if (!res.headersSent) {
          res.status(500).send('Error downloading the requested file.');
        }
      }
    });
  } else {
    res.status(404).send('File not found.');
  }
});

app.listen(PORT, (err) => {
  if (err) {
    console.error('Failed to start server:', err);
  } else {
    console.log(`Server is listening on http://localhost:${PORT}`);
  }
});