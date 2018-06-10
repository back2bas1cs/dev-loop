const express = require('express');
const gravatar = require('gravatar');
const auth = express.Router();

// require in mongoose User model
const User = require('../models/User');

// @route:  GET api/auth/test
// @desc:   test auth route
// @access: public
auth.get('/test', (req, res) => {
  res.json({ msg: 'we authin' });
});

// @route:  POST api/auth/register
// @desc:   register user
// @access: public (can only register if not already signed in)
auth.post('/register', (req, res) => {
  // check to see if user already exists (by email)
  User
    .findOne({ email: req.body.email })
    .then(user => {
      // if user exists, throw error
      if (user) res.status(400).json({ error: 'Email is already registered!'});
      else {
        // create new user
        // add avatar/icon from gravatar (check to see if email exists)
        const avatar = gravatar.url(req.body.email, {s: '200', r: 'pg', d: 'mm'});
        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
          avatar
        });
      }
    });

});

module.exports = auth;
