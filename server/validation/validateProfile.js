// use validator to help filter/authorize user PROFILE input
const validator = require('validator');

const { areErrors, isEmptyField } = require('./validationHelpers.js');

module.exports = function validateProfileInput(input) {

  // all possible (required) types of PROFILE errors
  const profileErrors = {
    handle: [],
    title: [],
    skills: []
  };

  // first, check if any required PROFILE input fields are empty -- this should always be the first error we pop off the given "error stack"
  for (let prop in profileErrors) {
    if (isEmptyField(input[prop]) &&
      profileErrors[prop] !== undefined &&
      prop !== 'skills') {
        profileErrors[prop].push(`${prop} is required`);
    };
  }

  // @PROFILE-handle-validation:
  // set min/max limit on characters on handle
  const HANDLE_MIN = 4, HANDLE_MAX = 35;
  if (!validator.isLength(input.handle, { min: HANDLE_MIN })) {
    profileErrors['handle'].push(`handle must be at least ${HANDLE_MIN} characters long`);
  } else if (!validator.isLength(input.handle, { max: HANDLE_MAX })) {
    profileErrors['handle'].push(`handle must be less than ${HANDLE_MAX} characters long`);
  }

  // @PROFILE-bio-validation:
  // set max limit on characters in bio
  const BIO_MAX = 400;
  profileErrors.bio = [];
  if (!validator.isLength(input.bio, { max: BIO_MAX })) {
    profileErrors['bio'].push(`please limit the length of your bio to a maximum of ${BIO_MAX} characters`);
  }

  // @PROFILE-URL-validation:
  // add (un-required) website errors
  const urlFields = [
    'website', 'linkedin', 'facebook', 'twitter', 'youtube', 'github'
  ];
  urlFields.forEach(url => {
    profileErrors[url] = []
    if (!validator.isURL(input[url]) && !isEmptyField(input[url])) {
      profileErrors[url].push(`invalid ${url} URL`);
    }
  });

  // PROFILE-skills-validation
  // must add at least two skills to profile
  const MIN_SKILLS = 2;
  if (input.skills.split(',').length < MIN_SKILLS) {
    profileErrors.skills.push(`please add at least ${MIN_SKILLS} skills to get started`);
  }

  return {
    profileErrors,
    isValidProfile: !areErrors(profileErrors)
  };
}
