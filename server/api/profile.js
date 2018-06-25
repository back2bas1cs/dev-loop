const express = require('express');
const passport = require('passport');

const Profile = require('../models/Profile');
const User = require('../models/User');

// initialize PROFILE (aka: "prof") router
const prof = express.Router();

// @route:  POST api/profile
// @descr:  create new user profile
// @access: private (add passport middleware)
prof.post('/', passport.authenticate( 'jwt', { session: false }), (req, res) => {
  const newProfile = new Profile({
    // name, email, and avatar are attached to user_id
    user_id: req.user.id,
    handle: req.body.handle || null,
    title: req.body.title || null,
    location: req.body.location || null,
    company: req.body.company || null,
    website: req.body.website || null,
    location: req.body.location || null,
    social: {
      linkedin: req.body.linkedin || null,
      facebook: req.body.facebook || null,
      linkedin: req.body.twitter || null,
      youtube: req.body.youtube || null,
    },
    github: req.body.github || null,
    bio: req.body.bio || null,
    skills: req.body.skills || null,
  });
  // Profile.
});

// @route:  GET api/profile
// @descr:  retrieve current (i.e. logged-in) user's profile
// @access: private (add passport middleware)
prof.get('/', passport.authenticate( 'jwt', { session: false }), (req, res) => {
  // NOTE: why does the data save to req.user???
  Profile.findOne({ user_id: req.user.id })
    .then(profile => {
      if (!profile) {
        // user's profile not found (i.e. has not yet been created)
        res.status(404).json({ profile: 'no profile exists yet for this user' })
      } else {
        res.status(200).json(profile);
      }
    })
    .catch(err => res.status(404).json(err));
});

module.exports = prof;
