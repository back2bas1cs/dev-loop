// use validator to help filter/authorize user registration input
const validator = require('validator');

const { areErrors, isEmptyField } = require('./validationHelpers');

module.exports = function validateRegistrationInput(input) {

  let registrationErrors = {
    name: [],
    email: [],
  };

  // first, check if any of the input fields are empty
  for (let prop in input) {
    console.log(prop)
    if (isEmptyField(input[prop])) {
      registrationErrors[prop].push(`${prop} field is required`)
    };
  }

  // @name-validation:
  // set minimum/maximum limit on characters in name
  const NAME_MIN = 3, NAME_MAX = 30;

  if (!validator.isLength(input.name, { min: NAME_MIN })) {
    registrationErrors['name'].push(`name must be more than ${NAME_MIN - 1} characters long`);
  } else if (!validator.isLength(input.name, { max: NAME_MAX })) {
    registrationErrors.name = `name must be less than ${NAME_MAX} characters long`;
  }



  // @email-vaidation:

  return {
    registrationErrors,
    areErrors: areErrors(registrationErrors)
  }
}
