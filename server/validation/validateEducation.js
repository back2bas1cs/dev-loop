// use validator to help filter/authorize (new) EDUCATION section input
const validator = require('validator');

const { areErrors, isEmptyField } = require('./validationHelpers.js');

module.exports = function validateEducationInput(input) {

  // all possible (required) types of EDUCATION errors
  const educationErrors = {
    school: [],
    fieldOfStudy: [],
    degree: [],
    startDate: []
  };

  // first, check if any EDUCATION input fields are empty -- this should always be the first error we pop off the given "error stack"
  for (let prop in input) {
    if (isEmptyField(input[prop]) && educationErrors[prop] !== undefined) {
      educationErrors[prop].push(`${prop} is required`);
    };
  }

  return {
    educationErrors,
    isValidEducation: !areErrors(educationErrors)
  };
}
