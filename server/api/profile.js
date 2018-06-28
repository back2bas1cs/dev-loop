const express = require('express');
const passport = require('passport');

const Profile = require('../models/Profile');
const User = require('../models/User');

const validateProfileInput = require('../validation/validateProfile');

// initialize PROFILE (aka: "prof") router
const prof = express.Router();

// @route:  POST api/profile
// @descr:  create/update user profile
// @access: private (add passport middleware)
prof.post('/', passport.authenticate( 'jwt', { session: false }), (req, res) => {
  const { profileErrors, isValidProfile } = validateProfileInput(req.body);
  // check PROFILE input validation for errors
  if (!isValidProfile) {
    return res.status(400).json(profileErrors);
  }
  const userProfile = {
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
    // skills -- array of strings
    skills: req.body.skills || null
  };
  // find user's profile in DB by user ID
  Profile.findOne({ user_id: req.user.id })
    .then(profile => {
      // CREATE new profile (if one does not exist)
      if (!profile) {
        // first, check/validate handle
        Profile.findOne({ handle: userProfile.handle })
          .then(profileWithHandle => {
            if (profileWithHandle) {
              // if handle exists and belongs to another user
              profileErrors['handle'].push('sorry, that handle is already taken');
              return res.status(400).json(profileErrors);
            } else {
              // save new profile (with new/un-used handle)
              new Profile(userProfile).save()
                .then(newProfile => res.status(200).json(newProfile));
            }
          });
      // UPDATE existing profile
      } else {
        Profile.findOne({ handle: userProfile.handle })
          .then(profileWithHandle => {
            // again, must first validate handle by checking if it already belongs to another user, or matches the user's current handle
            if (profileWithHandle) {
              // if input matches user's current handle
              if (profileWithHandle.user_id == req.user.id) {
                profileErrors['handle'].push(`${userProfile.handle} is already your active handle`);
              } else {
                profileErrors['handle'].push('sorry, that handle is already taken');
              }
              return res.status(400).json(profileErrors);
            } else {
              // save new profile (with new/un-used handle)
              Profile.findOneAndUpdate(
                { user_id: req.user.id },
                // object model we want to use to update document
                { $set: userProfile },
                // return UPDATED version of document
                { new: true }
              )
              .then(updatedProfile => {
                res.status(200).json(updatedProfile)
              });
            }
          });
      }
    })

    // education: [
    //   {
    //     school: req.body.school || null,
    //     location: req.body.location || null,
    //     fieldAndDegree: [
    //       {
    //         fieldOfStudy: req.body.fieldOfStudy || null,
    //         degree: req.body.degree || null,
    //         gpa: req.body.gpa || null
    //       }
    //     ],
    //     startDate: req.body.startDate || null,
    //     endDate: req.body.endDate || null
    //   }
    // ]

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
