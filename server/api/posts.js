const express = require('express');

// initialize router
const posts = express.Router();

// @route:  GET api/posts/test
// @desc:   test post route
// @access: public
posts.get('/test', (req, res) => {
  res.json({ msg: 'we postin' });
});

module.exports = posts;
