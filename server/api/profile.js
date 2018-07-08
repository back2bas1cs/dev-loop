const express = require('express');
const passport = require('passport');

const Profile = require('../models/Profile.js');
const User = require('../models/User.js');

const validateProfileInput = require('../validation/validateProfile.js');
const validateEducationInput = require('../validation/validateEducation.js');
// const validateFieldAndDegreeInput = require('../validation/validateFieldAndDegree.js');
const validateExperienceInput = require('../validation/validateExperience.js');

// initialize PROFILE (aka: "prof") router
const prof = express.Router();

// @route:  POST api/profile
// @descr:  create/update user profile
// @access: private (add passport middleware)
prof.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {

  const { profileErrors, isValidProfile } = validateProfileInput(req.body);
  // check PROFILE input validation for errors
  if (!isValidProfile) {
    return res.status(400).json(profileErrors);
  }

  const userProfile = {
    // name, email, and avatar are attached to user id
    user: req.user.id,
    handle: req.body.handle || null,
    title: req.body.title || null,
    location: req.body.location || null,
    company: req.body.company || null,
    website: req.body.website || null,
    location: req.body.location || null,
    social: {
      linkedin: req.body.linkedin || null,
      facebook: req.body.facebook || null,
      twitter: req.body.twitter || null,
      youtube: req.body.youtube || null,
    },
    github: req.body.github || null,
    bio: req.body.bio || null,
    // save skills as array of strings
    skills: req.body.skills.split(',') || null
  };

  // find user's profile in DB by user id
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      if (!profile) {
        // CREATE new profile (if one does not exist)
        // first, check/validate handle
        Profile.findOne({ handle: userProfile.handle })
          .then(profileWithHandle => {
            if (profileWithHandle) {
              // if handle exists and belongs to another user
              profileErrors['handle'].push('sorry, that handle is already taken');
              return res.status(400).json(profileErrors);
            } else {
              // save new profile (with new/available handle)
              new Profile(userProfile).save()
                .then(newProfile => res.status(200).json(newProfile));
            }
          });
      } else {
        // UPDATE existing profile
        Profile.findOne({ handle: userProfile.handle })
          .then(profileWithHandle => {
            // again, must validate handle by checking if it already belongs to another user, or matches the user's current handle
            if (profileWithHandle && String(profileWithHandle.user) !== userProfile.user) {
              // if input matches a handle used by a different user, throw error
              profileErrors['handle'].push('sorry, that handle is already taken');
              return res.status(400).json(profileErrors);
            } else {
              // save new profile (with new/valid handle)
              Profile.findOneAndUpdate(
                { user: req.user.id },
                // object model we want to use to update document
                { $set: userProfile },
                // return newly UPDATED version of document
                { new: true }
              )
              .then(updatedProfile => {
                res.status(200).json(updatedProfile);
              })
              .catch(err => res.status(404).json(err));
            }
          })
          .catch(err => res.status(400).json(err));
      }
    });
});

// @route:  GET api/profile
// @descr:  retrieve (logged-in) user's current profile
// @access: private (add passport middleware)
prof.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if (profile) {
        res.status(200).json(profile);
      } else {
        // profile not found (i.e. not yet been created)
        res.status(404).json({ profile: 'profile not yet created' })
      }
    })
    .catch(err => res.status(400).json(err));
});

// @route:  GET api/profile/dev/:handle
// @descr:  retrieve a user's profile by handle
// @access: public
prof.get('/dev/:handle', (req, res)=> {
  Profile.findOne({ handle: req.params.handle })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if (profile) {
        res.status(200).json(profile);
      } else {
        // profile not found (i.e. not yet been created, or user doesn't exist)
        res.status(404).json({ profile: 'cannot find profile matching given handle' })
      }
    })
    .catch(err => res.status(404).json(err));
});

// @route:  GET api/profile/user/:user_id
// @descr:  retrieve a user's profile by user_id
// @access: public
prof.get('/user/:user_id', (req, res)=> {
  Profile.findOne({ user: req.params.user_id })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if (profile) {
        res.status(200).json(profile);
      } else {
        // profile not found (i.e. not yet been created)
        res.status(404).json({ profile: 'no profile exists yet for this user' })
      }
    })
    // user doesn't exist in DB
    .catch(err => res.status(404).json({ user: 'no user exists with that user id'}));
});

// @route:  GET api/profile/all
// @descr:  retrieve all user's profiles (if any exist)
// @access: public
prof.get('/all', (req, res) => {
  Profile.find()
    .then(profiles => {
      if (profiles) {
        res.status(200).json(profiles);
      } else {
        // no profiles have been created
        res.status(404).json({ profile: 'no registered user has created a profile yet. please be the first to create a profile!' })
      }
    })
    // no users are currently registered
    .catch(err => res.status(404).json({ critical: 'there are NO users currently registered with devLoop. in other words, the site is a complete failure, so far... please be the first to register, and invite your friends!' }));
});

// @route:  POST api/profile/education
// @descr:  add new education section to profile
// @access: private
prof.post('/education', passport.authenticate('jwt', { session: false }), (req, res) => {

  const { educationErrors, isValidEducation } = validateEducationInput(req.body);
  // check EDUCATION input validation for errors
  if (!isValidEducation) {
    return res.status(400).json(educationErrors);
  }

  Profile.findOne({ user: req.user.id })
    .then(profile => {
      const newEducationSection = {
        school: req.body.school,
        location: req.body.location,
        startDate: req.body.startDate,
        endDate: req.body.endDate
      };
      // add new experience to experience array (from Profile model)
      profile.education.unshift(newEducationSection);
      profile.save()
        .then(updatedProfile => {
          res.status(200).json(updatedProfile);
        })
        .catch(err => res.status(500).json(err));
    });
});

// @route:  DELETE api/profile/education/:education_id
// @descr:  delete given education section from user's profile
// @access: private
prof.delete('/education/:education_id', passport.authenticate('jwt', { session: false}), (req, res) => {
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      // filter out education section from array, and re-assign updated array
      const updatedEducation = profile.education
        .filter(section =>section.id !== req.params.education_id);
      profile.education = updatedEducation;
      // save profile with updated education
      profile.save()
        .then(updatedProfile => res.json(updatedProfile));
    })
    .catch(err => res.status(404).json(err));
});

// @route:  POST api/profile/education/degree
// @descr:  add new field and degree to given education section of profile
// @access: private
prof.get('/education/:education_id', passport.authenticate('jwt', { session: false }), (req, res) => {

  // const { degreeErrors, isValidDegree } = validateFieldAndDegreeInput(req.body);
  // // check EDUCATION input validation for errors
  // if (!isValidDegree) {
  //   return res.status(400).json(degreeErrors);
  // }
  //
  // Profile.findOne({ user: req.user.id })
  //   .then(profile => {
  //     if (profile) {
  //       profile.education
  //         .filter(item => item.id === req.params.education_id)
  //     Profile.findOneAndUpdate(
  //         { user: req.user.id },
  //         // object model we want to use to update document
  //         { $set: userProfile },
  //         // return newly UPDATED version of document
  //         { new: true }
  //       )
  //     console.log(...education)
  //
  //     }
  //
  //   });

});

// @route:  POST api/profile/experience
// @descr:  add new experience section to profile
// @access: private
prof.post('/experience', passport.authenticate('jwt', { session: false }), (req, res) => {

  const { experienceErrors, isValidExperience } = validateExperienceInput(req.body);
  // check EXPERIENCE input validation for errors
  if (!isValidExperience) {
    return res.status(400).json(experienceErrors);
  }

  Profile.findOne({ user: req.user.id })
    .then(profile => {
      const newExperienceSection = {
        role: req.body.role,
        location: req.body.location,
        company: req.body.company,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        summary: req.body.summary
      };
      // add new experience to experience array (from Profile model)
      profile.experience.unshift(newExperienceSection);
      profile.save()
        .then(updatedProfile => {
          res.status(200).json(updatedProfile);
        })
        .catch(err => res.status(500).json(err));
    });
});

// @route:  DELETE api/profile/experience/:experience_id
// @descr:  delete given experience section from user's profile
// @access: private
prof.delete('/experience/:experience_id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      // filter out experience section from array, and re-assign updated array
      const updatedExperience = profile.experience
        .filter(section => section.id !== req.params.experience_id);
      profile.experience = updatedExperience;
      // save profile with updated experience
      profile.save()
        .then(updatedProfile => res.status(200).json(updatedProfile));
    })
    .catch(err => res.status(404).json(err));
});

module.exports = prof;
