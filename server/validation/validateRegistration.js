// use validator to help filter/authorize user registration input
const validator = require('validator');

const { areErrors, isEmptyField } = require('./validationHelpers');

module.exports = function validateRegistrationInput(input) {

  let registrationErrors = {
    name: [],
    email: [],
    password: [],
    confirmPassword: []
  };

  // first, check if any of the input fields are empty
  for (let prop in input) {
    console.log(prop)
    if (isEmptyField(input[prop])) {
      let both = (prop === 'password' ? 'both' : '');
      registrationErrors[prop].push(`${both} ${prop} field(s) is/are required`)
    };
  }

  // @name-validation:
  // set min/max limit on characters in name
  const NAME_MIN = 3, NAME_MAX = 30;

  if (!validator.isLength(input.name, { min: NAME_MIN })) {
    registrationErrors['name'].push(`name must be more than ${NAME_MIN - 1} characters long`);
  } else if (!validator.isLength(input.name, { max: NAME_MAX })) {
    registrationErrors['name'].push(`name must be less than ${NAME_MAX} characters long`);
  }

  // @email-validation:
  if (!validator.isEmail(input.email)) {
    registrationErrors['email'].push('invalid email');
  }

  // @password-validation:
  // set min/max character limit on password
  const PW_MIN = 6, PW_MAX = 25;

  if (!validator.isLength(input.password, { min: PW_MIN })) {
    registrationErrors['password'].push(`password must be more than ${PW_MIN - 1} characters long`);
  } else if (!validator.isLength(input.password, { max: PW_MAX })) {
    registrationError['name'].push(`password must be less than ${PW_MAX} characters long`);
  }

  // password confirmation (both passwords must match)
  if (!validator.equals(input.password, input.confirmPassword)) {
    registrationErrors['confirmPassword'].push('passwords must match');
  }

  return {
    registrationErrors,
    areErrors: areErrors(registrationErrors)
  }
}
