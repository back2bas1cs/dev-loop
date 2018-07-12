// use validator to help filter/authorize new POST input
const validator = require('validator');

const { areErrors, isEmptyField } = require('./validationHelpers.js');

module.exports = function validatePostInput(input) {

  // all possible (required) types of POST errors
  const postErrors = {
    post: []
  };

  // first, check if any new POST input fields are empty -- this should always be the first error we pop off the given "error stack"
  for (let prop in input) {
    if (isEmptyField(input[prop]) && postErrors[prop] !== undefined) {
      if (prop === 'post') postErrors[prop].push('say something!');
      else postErrors[prop].push(`${prop} is required`);
    };
  }

  // @POST-content-validation:
  // set min/max limit on characters on content/text
  const NAME_MIN = 12, NAME_MAX = 400;
  if (!validator.isLength(input.post, { min: NAME_MIN })) {
    postErrors['post'].push(`post must be at least ${NAME_MIN} characters long`);
  } else if (!validator.isLength(input.post, { max: NAME_MAX })) {
    postErrors['post'].push(`post must be less than ${NAME_MAX} characters long`);
  }

  return {
    postErrors,
    isValidPost: !areErrors(postErrors)
  };
}
