const express = require('express');

const profile = express.Router();

// @route:  GET api/profile/test
// @desc:   tests profile route
// @access: public
profile.get('/test', (req, res) => {
  res.json({ msg: 'we profilin' });
});

module.exports = profile;
