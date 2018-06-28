// use validator to help filter/authorize user PROFILE input
const validator = require('validator');

const { areErrors, isEmptyField } = require('./validationHelpers');

module.exports = function validateProfileInput(input) {

  // all possible (required) types of PROFILE errors
  const profileErrors = {
    handle: [],
    title: []
  };

  // first, check if any required PROFILE input fields are empty -- this should always be the first error we pop off the given "error stack"
  for (let prop in profileErrors) {
    if (isEmptyField(input[prop])) {
      profileErrors[prop].push(`${prop} is required`);
    };
  }

  // @PROFILE-handle-validation:
  // set min/max limit on characters on handle
  const NAME_MIN = 4, NAME_MAX = 35;
  if (!validator.isLength(input.handle, { min: NAME_MIN })) {
    profileErrors['handle'].push(`handle must be at least ${NAME_MIN} characters long`);
  } else if (!validator.isLength(input.handle, { max: NAME_MAX })) {
    profileErrors['handle'].push(`handle must be less than ${NAME_MAX} characters long`);
  }

  // @PROFILE-url-validation:
  // add all other (un-required) types of PROFILE errors
  const unrequiredWebsiteFields = [
    'website', 'linkedin', 'facebook', 'twitter', 'youtube', 'github'
  ];
  unrequiredWebsiteFields.forEach(prop => profileErrors[prop] = []);
  unrequiredWebsiteFields
    .forEach(url => {
        console.log('true test', typeof input[url])
        if (!validator.isURL(input[url]) && !isEmptyField(input[url])) {
          profileErrors[url].push(`invalid ${url} URL`);
        }
    });

  return {
    profileErrors,
    isValidProfile: !areErrors(profileErrors)
  };
}
