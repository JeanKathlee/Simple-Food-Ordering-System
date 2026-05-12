const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const { readJsonFromData } = require('../lib/readJson');
const { writeJsonToData } = require('../lib/writeJson');

const router = express.Router();

function splitName(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || 'Google',
    lastName: parts.slice(1).join(' ') || 'User',
  };
}

function buildSafeUser(user = {}) {
  const firstName = user.firstName || '';
  const lastName = user.lastName || '';
  return {
    id: user.id,
    firstName,
    lastName,
    name: `${firstName} ${lastName}`.trim() || user.name || '',
    email: user.email,
    role: user.role,
    mobileNumber: user.mobileNumber || '',
    address: user.address || '',
  };
}

router.post('/callback', async (req, res) => {
  const { code } = req.body;

  try {
    console.log('Google auth callback started with code:', code?.substring(0, 20) + '...');

    // exchange code for token
    const tokenRes = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: 'http://localhost:5173/auth/callback',
      grant_type: 'authorization_code',
    });

    console.log('Got access token from Google');

    // kuha user info
    const userRes = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
      headers: { Authorization: `Bearer ${tokenRes.data.access_token}` },
    });

    const { email, name } = userRes.data;
    const { firstName, lastName } = splitName(name);
    console.log('Got user info from Google:', email);

    // find or create user
    const data = readJsonFromData('users.json');
    let user = data.users.find(u => u.email === email);

    if (!user) {
      console.log('User not found, creating new user');
      const newId = Math.max(...data.users.map(u => u.id || 0), 0) + 1;
      const passwordHash = bcryptjs.hashSync('google-oauth', 10);
      
      user = {
        id: newId,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`.trim(),
        email,
        passwordHash,
        role: 'customer',
        mobileNumber: '',
        address: '',
        createdAt: new Date().toISOString(),
      };
      
      data.users.push(user);
      writeJsonToData('users.json', data);
      console.log('New user created:', user.id);
    } else {
      console.log('Existing user found:', user.id);
    }

    // create JWT
    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    console.log('JWT token created successfully');
    res.json({ token, user: buildSafeUser(user) });
  } catch (err) {
    console.error('Google auth error:', err.message);
    console.error('Full error:', err);
    res.status(400).json({ message: 'Google auth failed: ' + err.message });
  }
});

module.exports = router;
