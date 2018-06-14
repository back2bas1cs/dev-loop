// use validator to filter/authorize user registration input
const validator = require('validator');

module.exports = function validateRegistrationInput(input) {

  let registrationErrors = {};

  // put minimum/maximum limit on characters in name
  const NAME_MIN = 3, NAME_MAX = 30;

  if (!validator.isLength(input.name) >= NAME_MIN) {
    registrationErrors.name = `Name must be more than ${NAME_MIN - 1} characters`;
  } else if (!validator.isLength(input.name) <= NAME_MAX) {
    registrationErrors.name = `Name must be less than ${NAME_MAX} characters`;
  }

  // ensure email is valid

  return {
    registrationErrors
  }
}
