const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const { pool } = require('./db.config'); // adjust path as needed
const jwt = require('jsonwebtoken');

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const [[user]] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
  done(null, user);
});

// GOOGLE
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  const email = profile.emails[0].value;
  let [[user]] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  if (!user) {
    // Create user if not exists
    const [result] = await pool.query(
      'INSERT INTO users (email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)',
      [email, 'OAUTH', profile.name.givenName, profile.name.familyName, 'customer']
    );
    [[user]] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
  }
  done(null, user);
}));

// FACEBOOK
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  callbackURL: 'http://localhost:5000/api/auth/facebook/callback',
  profileFields: ['id', 'emails', 'name']
}, async (accessToken, refreshToken, profile, done) => {
  const email = profile.emails[0].value;
  let [[user]] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  if (!user) {
    const [result] = await pool.query(
      'INSERT INTO users (email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)',
      [email, 'OAUTH', profile.name.givenName, profile.name.familyName, 'customer']
    );
    [[user]] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
  }
  done(null, user);
}));

module.exports = passport;
