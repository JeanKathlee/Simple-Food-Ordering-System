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
    addressBook: Array.isArray(user.addressBook) ? user.addressBook : [],
    profileImage: user.profileImage || '',
    lastOrderAddress: user.lastOrderAddress || '',
    lastOrderMobileNumber: user.lastOrderMobileNumber || '',
  };
}

router.post('/callback', async (req, res) => {
  const { code } = req.body;

  try {
    if (!code) {
      console.error('No code provided in Google auth callback');
      return res.status(400).json({ message: 'No authorization code provided' });
    }

    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      console.error('Missing Google OAuth credentials');
      return res.status(500).json({ message: 'Server misconfigured' });
    }

    console.log('Google auth callback started with code:', code.substring(0, 20) + '...');

    // exchange code for token
    let tokenRes;
    try {
      tokenRes = await axios.post('https://oauth2.googleapis.com/token', {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: 'http://localhost:5173/auth/callback',
        grant_type: 'authorization_code',
      });
    } catch (tokenErr) {
      console.error('Failed to get Google token:', tokenErr.response?.data || tokenErr.message);
      return res.status(401).json({ message: 'Invalid authorization code' });
    }

    console.log('Got access token from Google');

    // Get user info
    let userRes;
    try {
      userRes = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
        headers: { Authorization: `Bearer ${tokenRes.data.access_token}` },
      });
    } catch (userErr) {
      console.error('Failed to get user info:', userErr.message);
      return res.status(401).json({ message: 'Failed to get user info from Google' });
    }

    const { email, name } = userRes.data;
    const { firstName, lastName } = splitName(name);
    console.log('Got user info from Google:', email);

    if (!email) {
      console.error('Google user has no email');
      return res.status(400).json({ message: 'Google account must have an email' });
    }

    // Find or create user
    let data;
    try {
      data = readJsonFromData('users.json');
    } catch (readErr) {
      console.error('Failed to read users.json:', readErr.message);
      return res.status(500).json({ message: 'Failed to read user database' });
    }

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
        addressBook: [],
        profileImage: '',
        lastOrderAddress: '',
        lastOrderMobileNumber: '',
        createdAt: new Date().toISOString(),
      };
      
      data.users.push(user);
      try {
        writeJsonToData('users.json', data);
        console.log('New user created:', user.id);
      } catch (writeErr) {
        console.error('Failed to write users.json:', writeErr.message);
        return res.status(500).json({ message: 'Failed to save user' });
      }
    } else {
      console.log('Existing user found:', user.id);
    }

    // Create JWT
    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    console.log('JWT token created successfully');
    res.json({ token, user: buildSafeUser(user) });
  } catch (err) {
    console.error('Unexpected Google auth error:', err.message);
    console.error('Full error stack:', err.stack);
    res.status(500).json({ message: 'Unexpected error during authentication' });
  }
});

module.exports = router;
