// use validator to help filter/authorize (new) FIELD/DEGREE section input
const validator = require('validator');

const { areErrors, isEmptyField } = require('./validationHelpers.js');

module.exports = function validateFieldAndDegreeInput(input) {

  // all possible (required) types of FIELD/DEGREE errors
  const degreeErrors = {
    fieldOfStudy: [],
    degree: []
  };

  // first, check if any FIELD/DEGREE input fields are empty -- this should always be the first error we pop off the "error stack"
  for (let prop in input) {
    if (isEmptyField(input[prop]) && degreeErrors[prop] !== undefined) {
      degreeErrors[prop].push(`${prop} is required`);
    };
  }

  return {
    degreeErrors,
    isValidDegree: !areErrors(degreeErrors)
  };
}
