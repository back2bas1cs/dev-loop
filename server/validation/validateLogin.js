// use validator to help filter/authorize user LOGIN input
const validator = require('validator');

const { areLoginErrors, isEmptyField } = require('./validationHelpers');

module.exports = function validateLoginInput(input) {

  // all possible types of LOGIN errors
  const loginErrors = {
    email: [],
    password: []
  };

  // first, check if any of the LOGIN input fields are empty (i.e. email, password) -- this should always be the first error we pop off the "error stack"
  for (let prop in input) {
    if (isEmptyField(input[prop])) {
      loginErrors[prop].push(`${prop} required`);
    };
  }

  // @LOGIN-email-validation:
  if (!validator.isEmail(input.email)) {
    loginErrors['email'].push('invalid email');
  }

  return {
    loginErrors,
    isValidLogin: !areLoginErrors(loginErrors)
  }
}
