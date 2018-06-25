// use validator to help filter/authorize user login input
const validator = require('validator');

const { areLoginErrors, isEmptyField } = require('./validationHelpers');

module.exports = function validateLoginInput(input) {

  // all possible types of login errors
  let loginErrors = {
    email: [],
    password: []
  };

  // first, check if any of the input fields are empty (i.e. email, password) -- this should always be the first error we pop off the "error stack"
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
