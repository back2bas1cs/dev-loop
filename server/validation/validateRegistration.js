// use validator to help filter/authorize user REGISTRATION input
const validator = require('validator');

const { areErrors, isEmptyField } = require('./validationHelpers');

module.exports = function validateRegistrationInput(input) {

  // all possible types of REGISTRATION errors
  const registrationErrors = {
    name: [],
    email: [],
    password: [],
    password_confirmation: []
  };

  // first, check if any REGISTRATION input fields are empty -- this should always be the first error we pop off the given "error stack"
  for (let prop in input) {
    if (isEmptyField(input[prop])) {
      registrationErrors[prop].push(`${prop} is required`);
    };
  }

  // @REGISTRATION-name-validation:
  // set min/max limit on characters on name
  const NAME_MIN = 2, NAME_MAX = 30;
  if (!validator.isLength(input.name, { min: NAME_MIN })) {
    registrationErrors['name'].push(`name must be at least ${NAME_MIN} characters long`);
  } else if (!validator.isLength(input.name, { max: NAME_MAX })) {
    registrationErrors['name'].push(`name must be less than ${NAME_MAX} characters long`);
  }

  // @REGISTRATION-email-validation:
  if (!validator.isEmail(input.email)) {
    registrationErrors['email'].push('invalid email');
  }
  // @REGISTRATION-password-validation:
  // set min/max character limit on password
  const PW_MIN = 7, PW_MAX = 25;
  if (!validator.isLength(input.password, { min: PW_MIN })) {
    registrationErrors['password'].push(`password must be at least ${PW_MIN} characters long`);
  } else if (!validator.isLength(input.password, { max: PW_MAX })) {
    registrationErrors['password'].push(`password must be less than ${PW_MAX} characters long`);
  }

  // password should only contain letters and numbers
  if (!validator.isAlphanumeric(input.password, 'en-US')) {
    registrationErrors['password'].push('passwords should only contain letters and numbers');
  }

  // TODO: password must contain at least one number and one upper-case letter


  // password confirmation (both input passwords must match)
  if (!validator.equals(input.password, input.password_confirmation)) {
    registrationErrors['password_confirmation'].push('passwords do not match. please try again');
  }

  return {
    registrationErrors,
    isValidRegistration: !areErrors(registrationErrors)
  };
}
