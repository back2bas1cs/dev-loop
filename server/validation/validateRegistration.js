// use validator to help filter/authorize user REGISTRATION input
const validator = require('validator');

const { areRegistrationErrors, isEmptyField } = require('./validationHelpers');

module.exports = function validateRegistrationInput(input) {

  // all possible types of REGISTRATION errors
  let registrationErrors = {
    name: [],
    email: [],
    password: [],
    'password-confirmation': []
  };

  // first, check if any of the REGISTRATION input fields are empty (i.e. name, email, password, password-confirmation) -- this should be the first error we pop off the "error stack"
  for (let prop in input) {
    if (isEmptyField(input[prop])) {
      registrationErrors[prop].push(`${prop} required`);
    };
  }

  // @REGISTRATION-name-validation:
  // set min/max limit on characters in name
  const NAME_MIN = 3, NAME_MAX = 30;

  if (!validator.isLength(input.name, { min: NAME_MIN })) {
    registrationErrors['name'].push(`name must be more than ${NAME_MIN - 1} characters long`);
  } else if (!validator.isLength(input.name, { max: NAME_MAX })) {
    registrationErrors['name'].push(`name must be less than ${NAME_MAX} characters long`);
  }

  // @REGISTRATION-mail-validation:
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
  if (!validator.equals(input.password, input['password-confirmation'])) {
    registrationErrors['password-confirmation'].push('passwords do not match. please try again');
  }

  return {
    registrationErrors,
    isValidRegistration: !areRegistrationErrors(registrationErrors)
  }
}
