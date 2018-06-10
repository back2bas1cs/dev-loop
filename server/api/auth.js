const express = require('express');
const gravatar = require('gravatar');
const bcrypt =  require('bcryptjs');

const auth = express.Router();

// require in mongoose User model
const User = require('../models/User');

// @route:  GET api/auth/test
// @desc:   NOTE: test auth route
// @access: public
auth.get('/test', (req, res) => {
  res.json({ msg: 'we authin' });
});

// @route:  POST api/auth/register
// @desc:   register new user
// @access: public (can only register if not already signed in)
auth.post('/register', (req, res) => {
  // check (by email) to see if user already exists
  User.findOne({ email: req.body.email })
    .then(user => {
      // if user exists, throw error
      if (user) {
        return res.status(400).json({ email: 'That email is already registered with devLoop!' });
      } else {
        // add avatar/icon from gravatar (check to see if email exists)
        const avatar = gravatar.url(req.body.email, {
          s: '100', // size
          r: 'pg',  // photo rating (let's keep things PG)
          d: 'mm'   // use default icon
        });
        // introduce new User model instance
        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
          avatar
        });
        // async encryption of password w/bcrypt -- generate hash and salt on separate function calls
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            // save() new instance of User to our DB, with encrypted password
            newUser.save()
              .then(user => res.status(200).json(user))
              .catch(err => console.log(err));
          });
        });
      }
  });
});


// @route:  POST api/auth/login
// @desc:   user login (returns JWT token)
// @access: public
auth.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email })
    .then(user => {
      // check if user exists (email registration)
      if (!user) res.status(404).json({ email: 'Unregistered email' });
      // check if password is correct
      bcrypt.compare(password, user.password)
        .then(areMatching => {
          if (areMatching) res.json({ msg: 'Success'});
          else res.status(400).json({ password: 'Incorrect email & password combination!'})
        });
    });
});

module.exports = auth;
