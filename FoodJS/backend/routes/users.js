const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { readJsonFromData } = require('../lib/readJson');
const { writeJsonToData } = require('../lib/writeJson');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

function splitLegacyName(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' ') || '',
  };
}

function buildSafeUser(user = {}) {
  const derived = splitLegacyName(user.name);
  const firstName = user.firstName || derived.firstName;
  const lastName = user.lastName || derived.lastName;

  return {
    id: user.id,
    firstName,
    lastName,
    name: `${firstName} ${lastName}`.trim() || user.name || '',
    email: user.email,
    role: user.role,
    mobileNumber: user.mobileNumber || '',
    address: user.address || '',
    createdAt: user.createdAt,
  };
}

// Generate ID sa user
function getNextUserId() {
  const data = readJsonFromData('users.json');
  const maxId = Math.max(...(data.users || []).map(u => u.id), 0);
  return maxId + 1;
}

// POST method, Create new user account
router.post('/register', async (req, res) => {
  const { email, password, firstName, lastName, mobileNumber, address } = req.body || {};
  const cleanFirstName = String(firstName || '').trim();
  const cleanLastName = String(lastName || '').trim();

  if (!email || !password || !cleanFirstName || !cleanLastName) {
    return res
      .status(400)
      .json({ message: 'Email, password, first name, and last name are required.' });
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
    firstName: cleanFirstName,
    lastName: cleanLastName,
    name: `${cleanFirstName} ${cleanLastName}`.trim(),
    email,
    passwordHash,
    role: 'customer',
    mobileNumber: mobileNumber || '',
    address: address || '',
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
    user: buildSafeUser(newUser),
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
    user: buildSafeUser(user),
  });
});

router.get('/', (_req, res) => {
  const data = readJsonFromData('users.json');
  const safeUsers = (data.users || []).map(({ passwordHash, ...user }) => buildSafeUser(user));
  res.json(safeUsers);
});

router.get('/me', verifyToken, (req, res) => {
  const data = readJsonFromData('users.json');
  const currentUser = (data.users || []).find((user) => user.id === req.user.sub);

  if (!currentUser) {
    return res.status(404).json({ message: 'User not found.' });
  }

  return res.json(buildSafeUser(currentUser));
});

module.exports = router;
