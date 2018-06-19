// use validator to help filter/authorize user registration input
const validator = require('validator');

const { areLoginErrors, isEmptyField } = require('./validationHelpers');

module.exports = function validateLoginInput(input) {

  let loginErrors = {
    email: [],
    password: [],
  };

  // first, check if any of the input fields are empty
  for (let prop in input) {
    console.log(prop)
    if (isEmptyField(input[prop])) {
      let both = (prop === 'password' ? 'both' : '');
      loginErrors[prop].push(`${both} ${prop}(s) required`)
    };
  }

  // @email-validation:
  if (!validator.isEmail(input.email)) {
    loginErrors['email'].push('invalid email');
  }

  return {
    loginErrors,
    areLoginErrors: areLoginErrors(loginErrors)
  }
}
