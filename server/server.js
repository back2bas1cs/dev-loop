const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');

// require in DB config.
const db = require('../config/dbConfig.js').mongoURI;

// connect to mongoDB/mLab
mongoose.connect(db)
  .then(() => console.log('connected to MongoDB/mLab!'))
  .catch(err => console.log('error connecting to MongoDB/mLab:', err));

const app = express();

// body-parser middleware: construct req.body (from stream/chunks) and analyze for form data
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// passport middleware
app.use(passport.initialize());
// bring in passport config.
require('../config/passport.js')(passport);

// import routes for user authentication, profiles, and network feed/posts
const auth = require('../server/api/auth.js');
const profile = require('../server/api/profile.js');
const feed = require('../server/api/feed.js');

// map and deploy routes
app.use('/api/auth', auth);
app.use('/api/profile', profile);
app.use('/api/feed', feed);

const PORT = process.env.PORT || 3030;

app.listen(PORT, () => {
  console.log(`listening on ${PORT}...`);
});
