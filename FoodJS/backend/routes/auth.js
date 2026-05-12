const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { readJsonFromData } = require('../lib/readJson');
const { writeJsonToData } = require('../lib/writeJson');

const router = express.Router();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "383406826534-8al6042a0n42itk48fpis06m0r81ip8k.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "your-google-client-secret-here";
const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret-key";

router.post('/google/callback', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Authorization code is required' });
    }

    console.log('Google OAuth: Exchanging authorization code for token...');

    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: 'http://localhost:5173/auth/callback',
    });

    console.log('Token response received');
    const accessToken = tokenResponse.data.access_token;

    const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const googleUser = userInfoResponse.data;
    console.log('Google user:', googleUser.email);

    const usersData = readJsonFromData('users.json');
    let user = usersData.users.find((u) => u.email === googleUser.email);

    if (!user) {
      const newId = Math.max(...usersData.users.map((u) => u.id), 0) + 1;
      user = {
        id: newId,
        name: googleUser.name,
        email: googleUser.email,
        password: 'google-oauth',
        role: 'customer',
        createdAt: new Date().toISOString(),
      };
      usersData.users.push(user);
      writeJsonToData('users.json', usersData);
    }

    // Generate JWT token
    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('Token received and user authenticated:', googleUser.email);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Google OAuth error:', error.message);
    if (error.response) {
      console.error('Google API response error:', error.response.status, error.response.data);
    }
    res.status(500).json({ 
      message: 'Google authentication failed', 
      error: error.message,
      details: error.response?.data || null
    });
  }
});

module.exports = router;
