// use validator to help filter/authorize user LOGIN input
const validator = require('validator');

const { areErrors, isEmptyField } = require('./validationHelpers.js');

module.exports = function validateLoginInput(input) {

  // all possible (required) types of LOGIN errors
  const loginErrors = {
    email: [],
    password: []
  };

  // first, check if any LOGIN input fields are empty -- this should always be the first error we pop off the given "error stack"
  for (let prop in input) {
    if (isEmptyField(input[prop]) && loginErrors[prop] !== undefined) {
      loginErrors[prop].push(`${prop} is required`);
    };
  }

  // @LOGIN-email-validation:
  if (!validator.isEmail(input.email)) {
    loginErrors['email'].push('invalid email');
  }

  return {
    loginErrors,
    isValidLogin: !areErrors(loginErrors)
  };
}
