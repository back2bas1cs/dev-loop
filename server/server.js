const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');

// require in DB config.
const db = require('../config/dbConfig').mongoURI;

// connect to mongoDB/mLab
mongoose.connect(db)
  .then(() => console.log('connected to MongoDB/mLab!'))
  .catch(err => console.log('MongoDB Connection failure:', err));

const app = express();

// body-parser middleware: construct req.body (from stream/chunks) and analyze for form data
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// passport middleware
app.use(passport.initialize());
// bring in passport config.
require('../config/passport')(passport);

// import routes for user authentication, profiles, and network feed/posts
const auth = require('../server/api/auth');
const profile = require('../server/api/profile');
const posts = require('../server/api/posts');

// map and deploy routes
app.use('/api/auth', auth);
app.use('/api/profile', profile);
app.use('/api/posts', posts);

const PORT = process.env.PORT || 3030;

app.listen(PORT, () => {
  console.log(`listening on ${PORT}...`);
});
