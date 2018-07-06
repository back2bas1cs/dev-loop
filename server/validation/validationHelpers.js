module.exports = {
  isEmptyField: input => {
    return (input.constructor === String || typeof input === 'string') &&
    input.length === 0;
  },

  areErrors: input => {
    const errorTypes = Object.keys(input);
    // pre-ECMA 5
    if (input.constructor === Object) {
      for (var prop in input) {
        if (input[prop].constructor !== Array || input[prop].length !== 0) {
          return true;
        }
      }
    }
    // build JSON string of error types
    let jsonErrors = '{';
    for (let i = 0; i < errorTypes.length; i++) {
  	   jsonErrors += `"${errorTypes[i]}":[]`;
       jsonErrors += `${i === errorTypes.length - 1 ? '}' : ','}`;
     }
     // check against JSON stringified errors
    return JSON.stringify(input) !== jsonErrors;
  }
}
