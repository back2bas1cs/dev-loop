const express = require('express');
const mongoose = require('mongoose');

// import routes for user authentication, profiles, and media posts
const auth = require('../server/api/auth');
const profile = require('../server/api/profile');
const posts = require('../server/api/posts');


const app = express();
const PORT = process.env.PORT || 3030;

// reqire in our DB config.
const db = require('../config/mongo').mongoURI;

// connecting to mongoDB/mLab
mongoose
  .connect(db)
  .then(() => console.log('connected to mongoDB/mLab!'))
  .catch(err => console.log(err));


app.get('/', (req, res) => res.json('hello my name is JD'));

// map and deploy routes
app.use('/api/auth', auth);
app.use('/api/profile', profile);
app.use('/api/posts', posts);



app.listen(PORT, () => {
  console.log(`listening on ${PORT}...`);
});