const express = require('express');

// initialize router
const feed = express.Router();

// @route:  GET api/feed/test
// @desc:   test feed route
// @access: public
feed.get('/test', (req, res) => {
  res.json({ msg: 'we postin' });
});

module.exports = feed;
