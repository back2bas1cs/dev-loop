const mongoose = require('mongoose');

const Schema = mongoose.Schema;


// build/initialize PROFILE schema
const Profile = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  handle: {
    type: String,
    max: 35,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  location: { type: String },
  company: { type: String },
  website: { type: String },
  github: { type: String },
  bio: { type: String },
  education: [
    {
      school: {
        type: String,
        required: true
      },

    },
  ],
  experience: [
    {
      role: {
        type: String,
        required: true
      },
      company: {
        type: String,
        required: true
      },
      location: { type: String },
      startDate: {
        type: Date,
        required: true
      },
      endDate: {
        type: Date,
        default: Date.now()
      },
      summary: { type: String }
    }
  ],
  skills: { type: [String], required: true },


});

module.exports = mongoose.model('profile', Profile);
