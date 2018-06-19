// returns true if input is an empty Object
module.exports = {
  areErrors: input => {
    // pre-ECMA 5
    if (input.constructor === Object && Object.keys(input).length === 2) {
      for (var prop in input) {
        if (input[prop].constructor !== Array || input[prop].length !== 0) {
          return true;
        }
      }
    }
    return JSON.stringify(input) !== '{"name":[],"email":[]}';
  },

  isEmptyField: input => {
    return (input.constructor === String || typeof input === 'string') &&
      input.length === 0;
  }


}
