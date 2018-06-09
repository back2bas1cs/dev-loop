const express = require('express');

const auth = express.Router();

// @route:  GET api/auth/test
// @desc:   test auth route
// @access: public
auth.get('/test', (req, res) => {
  res.json({ msg: 'we authin' });
});

module.exports = auth;
