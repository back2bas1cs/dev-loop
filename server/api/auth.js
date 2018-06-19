const express = require('express');
const gravatar = require('gravatar');
const bcrypt =  require('bcryptjs');
const JWT = require('jsonwebtoken');
const passport = require('passport');

const user_secret = require('../../config/authConfig').USER_SECRET;
const User = require('../models/User');

const validateRegistrationInput = require('../validation/validateRegistration');
const validateLoginInput = require('../validation/validateLogin');

// initialize auth router
const auth = express.Router();

// @route:  POST api/auth/register
// @descr:  register new user
// @access: public (can only register if not already signed in)
auth.post('/register', (req, res) => {
  const { registrationErrors, areErrors } = validateRegistrationInput(req.body);
  // registration input { name, email, password(s) } validation
  if (areErrors) {
    return res.status(400).json(registrationErrors);
  }
  // check (by email) to see if user already exists
  User.findOne({ email: req.body.email })
    .then(user => {
      // if user exists, throw error
      if (user) {
        registrationErrors['email'].push('That email is already registered with devLoop!');
        res.status(400).json(registrationErrors);
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
// @descr:  user login (returns JWT token)
// @access: public
auth.post('/login', (req, res) => {

  const { loginErrors, areErrors } = validateLoginErrors(req.body);

  // check registration input { name, email, password(s) } validation for errors
  if (areErrors) {
    return res.status(400).json(loginErrors);
  }

  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email })
    .then(user => {
      // check if user exists (email registration)
      if (!user) {
        loginErrors['email'].push('unregistered email');
        res.status(404).json(loginErrors);
      }
      // use bCrypt to check if client-side password matches stored/hashed password
      bcrypt.compare(password, user.password)
        .then(passwordMatch => {
          if (passwordMatch) {
            // initialize JWT payload
            const payload = {
              id: user.id,
              name: user.name,
              avatar: user.avatar
            };
            // "sign" JWT and send back to client so they may access protected routes
            JWT.sign(payload, user_secret, { expiresIn: (4 * 3600) }, (err, token) => {
              res.json({
                success: true,
                token: 'Bearer ' + token
              });
            });
          } else {
            loginErrors['password'].push('Incorrect email/password combination!');
            res.status(401).json(loginErrors);
          }
        });
    });
});

// @route:  GET api/auth/user
// @descr:  return current user
// @access: private (add passport middleware)
auth.get('/user', passport.authenticate( 'jwt', { session: false }), (req, res) => {
  // NOTE: why does the data save to req.user???
  res.json(req.user);
});

module.exports = auth;
