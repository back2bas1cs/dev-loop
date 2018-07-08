// use validator to help filter/authorize (new) EXPERIENCE section input
const validator = require('validator');

const { areErrors, isEmptyField } = require('./validationHelpers.js');

module.exports = function validateExperienceInput(input) {

  // all possible (required) types of EXPERIENCE errors
  const experienceErrors = {
    role: [],
    company: [],
    startDate: []
  };
  
  // first, check if any EXPERIENCE input fields are empty -- this should always be the first error we pop off the given "error stack"
  for (let prop in input) {
    if (isEmptyField(input[prop]) && experienceErrors[prop] !== undefined) {
      console.log(prop)
      experienceErrors[prop].push(`${prop} is required`);
    };
  }

  return {
    experienceErrors,
    isValidExperience: !areErrors(experienceErrors)
  };
}
