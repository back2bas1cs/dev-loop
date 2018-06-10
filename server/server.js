const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// import routes for user authentication, profiles, and media posts
const auth = require('../server/api/auth');
const profile = require('../server/api/profile');
const posts = require('../server/api/posts');

const PORT = process.env.PORT || 3030;
const app = express();

// bodyParser MW: construct req.body (from stream/chunks) and analyze it for form data
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// require in our DB config.
const db = require('../config/mongo').mongoURI;
// connect to mongoDB/mLab
mongoose.connect(db)
  .then(() => console.log('connected to mongoDB/mLab!'))
  .catch(err => console.log("errrrrrrr", err));

// NOTE: test index route
app.get('/', (req, res) => res.json('hello my name is JD'));

// map and deploy routes
app.use('/api/auth', auth);
app.use('/api/profile', profile);
app.use('/api/posts', posts);

app.listen(PORT, () => {
  console.log(`listening on ${PORT}...`);
});
