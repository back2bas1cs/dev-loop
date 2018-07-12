const express = require('express');
const gravatar = require('gravatar');
const bcrypt =  require('bcryptjs');
const JWT = require('jsonwebtoken');
const passport = require('passport');

// bring in Profile (for user account deletion route)
const Profile = require('../models/Profile.js');
const User = require('../models/User.js');
const user_secret = require('../../config/authConfig.js').USER_SECRET;

const validateRegistrationInput = require('../validation/validateRegistration.js');
const validateLoginInput = require('../validation/validateLogin.js');

// initialize AUTHORIZATION (aka: "auth") router
const auth = express.Router();

// @route:  POST api/auth/register
// @descr:  register new user
// @access: public (can only register if user is NOT already signed in)
auth.post('/register', (req, res) => {

  const { registrationErrors, isValidRegistration } = validateRegistrationInput(req.body);
  // check registration input validation for errors
  if (!isValidRegistration) {
    return res.status(400).json(registrationErrors);
  }
  // check (via email) to see if user already exists
  User.findOne({ email: req.body.email })
    .then(user => {
      // if user exists, throw error
      if (user) {
        registrationErrors['email'].push('email is already registered with devLoop');
        res.status(400).json(registrationErrors);
      } else {
        // add avatar/icon from gravatar (check to see if email is registered with gravatar, else assign default user icon)
        const avatar = gravatar.url(req.body.email, {
          s: '300', // size
          r: 'pg',  // photo rating (let's keep things PG)
          d: 'mm'   // use default user icon
        });
        // build new user model instance
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
            // save() new instance of user to our DB, with encrypted password
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

  const { loginErrors, isValidLogin } = validateLoginInput(req.body);
  // check login input validation for errors
  if (!isValidLogin) {
    return res.status(400).json(loginErrors);
  }
  // store input email and password
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email })
    .then(user => {
      // check if user exists (via email registration)
      if (!user) {
        // throw unregistered email error here, where we access DB
        loginErrors['email'].push('email is not registered with devLoop');
        res.status(404).json(loginErrors);
      } else {
        // use bcrypt to check if client-side password matches stored/hashed password
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
              JWT.sign(payload, user_secret, { expiresIn: ( 6 * 3600 ) }, (err, token) => {
                res.json({
                  success: true,
                  token: 'Bearer ' + token
                });
              });
            } else {
              // throw error if given email is registered, but submitted/input password does not match encrypted password stored in DB
              loginErrors['password'].push('incorrect email/password combination');
              res.status(401).json(loginErrors);
            }
          })
          .catch(err => console.log(err));
        };
      });
});

// @route:  DELETE api/auth
// @descr:  delete current (logged-in) user's account (i.e. both user and profile)
// @access: private
auth.delete('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  // must delete profile first -- otherwise we won't have user's id to refer to
  Profile.findOneAndDelete({ user: req.user.id })
    .then(() => {
      User.findOneAndDelete({ _id: req.user.id })
      // if we can't locate account (i.e. user) by id, then we shouldn't be authorized to log in and delete our account (in other words, we don't really need error handling here)
        .then (() => {
          res.status(200).json({ user: 'account successfully deleted' });
        })
    })
    .catch(err => res.status(500).json(err));
});

module.exports = auth;
