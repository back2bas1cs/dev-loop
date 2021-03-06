const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// build/initialize USER schema
const User = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  avatar: { type: String },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('user', User);
