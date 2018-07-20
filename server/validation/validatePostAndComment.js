// use validator to help filter/authorize new POST input
const validator = require('validator');

const { areErrors, isEmptyField } = require('./validationHelpers.js');

module.exports = function validatePostAndCommentInput(input) {

  // all possible (required) types of POST/COMMENT errors
  const postErrors = {
    text: []
  };

  // first, check if any new POST/COMMENT input fields are empty -- this should always be the first error we pop off the given "error stack"
  for (let prop in input) {
    if (isEmptyField(input[prop]) && postErrors[prop] !== undefined) {
      if (prop === 'text') postErrors[prop].push('say something!');
      else postErrors[prop].push(`${prop} is required`);
    };
  }

  // @POST-COMMENT-content-validation:
  // set min/max limit on characters on content/text
  const NAME_MIN = 12, NAME_MAX = 400;
  if (!validator.isLength(input.text, { min: NAME_MIN })) {
    postErrors['text'].push(`post/comment must be at least ${NAME_MIN} characters long`);
  } else if (!validator.isLength(input.text, { max: NAME_MAX })) {
    postErrors['text'].push(`post/comment must be less than ${NAME_MAX} characters long`);
  }

  return {
    postErrors,
    isValidPost: !areErrors(postErrors)
  };
}
