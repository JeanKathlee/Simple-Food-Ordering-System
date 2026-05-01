const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { readJsonFromData } = require('../lib/readJson');
const { writeJsonToData } = require('../lib/writeJson');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

// Generate ID sa user
function getNextUserId() {
  const data = readJsonFromData('users.json');
  const maxId = Math.max(...(data.users || []).map(u => u.id), 0);
  return maxId + 1;
}

// POST method, Create new user account
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body || {};

  if (!email || !password || !name) {
    return res.status(400).json({ message: 'Email, password, and name are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  }

  const data = readJsonFromData('users.json');
  
  const existingUser = (data.users || []).find(
    (user) => String(user.email).toLowerCase() === String(email).toLowerCase()
  );

  if (existingUser) {
    return res.status(400).json({ message: 'Email already in use.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = {
    id: getNextUserId(),
    name,
    email,
    passwordHash,
    role: 'customer',
    createdAt: new Date().toISOString(),
  };

  data.users.push(newUser);

  // Save sa json database
  writeJsonToData('users.json', data);

  const token = jwt.sign(
    { sub: newUser.id, email: newUser.email, role: newUser.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  return res.status(201).json({
    message: 'Account created successfully.',
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    },
  });
});

// POST method, authenticate user
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const data = readJsonFromData('users.json');
  const user = (data.users || []).find(
    (item) => String(item.email).toLowerCase() === String(email).toLowerCase()
  );

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);

  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const token = jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  return res.json({
    message: 'Login successful.',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

router.get('/', (_req, res) => {
  const data = readJsonFromData('users.json');
  const safeUsers = (data.users || []).map(({ passwordHash, ...user }) => user);
  res.json(safeUsers);
});

module.exports = router;
