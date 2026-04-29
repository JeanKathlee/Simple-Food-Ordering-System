const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { readJsonFromData } = require('../lib/readJson');
const { writeJsonToData } = require('../lib/writeJson');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

// Helper: generate next user ID
function getNextUserId() {
  const data = readJsonFromData('users.json');
  const maxId = Math.max(...(data.users || []).map(u => u.id), 0);
  return maxId + 1;
}

// POST /api/users/register - Create a new user account
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body || {};

  // Validate input
  if (!email || !password || !name) {
    return res.status(400).json({ message: 'Email, password, and name are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  }

  // Read current users
  const data = readJsonFromData('users.json');
  
  // Check if email already exists
  const existingUser = (data.users || []).find(
    (user) => String(user.email).toLowerCase() === String(email).toLowerCase()
  );

  if (existingUser) {
    return res.status(400).json({ message: 'Email already in use.' });
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Create new user object
  const newUser = {
    id: getNextUserId(),
    name,
    email,
    passwordHash,
    role: 'customer', // New users are always customers
    createdAt: new Date().toISOString(),
  };

  // Add to users array
  data.users.push(newUser);

  // Save back to file
  writeJsonToData('users.json', data);

  // Generate token
  const token = jwt.sign(
    { sub: newUser.id, email: newUser.email, role: newUser.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  // Return response (without password hash)
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

// POST /api/users/login - Authenticate user and return token
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
