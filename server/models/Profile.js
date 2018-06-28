const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// build/initialize PROFILE schema
const Profile = new Schema({
  date: {
    type: Date,
    default: Date.now()
  },
  user_id: {
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
  // location: { type: String },
  // company: { type: String },
  website: { type: String },
  social: {
    linkedin: { type: String },
    facebook: { type: String },
    twitter: { type: String },
    youtube: { type: String }
  },
  github: { type: String },
  bio: { type: String },
  // skills: { type: [String], required: true },

  // education: [
  //   {
  //     school: {
  //       type: String,
  //       required: true
  //     },
  //     location: { type: String },
  //     fieldAndDegree: [
  //       {
  //         fieldOfStudy: {
  //           type: String,
  //           required: true
  //         },
  //         degree: {
  //           type: String,
  //           required: true
  //         },
  //         gpa: {
  //           type: Number
  //         }
  //       }
  //     ],
  //     startDate: {
  //       type: Date,
  //       required: true
  //     },
  //     endDate: {
  //       type: Date,
  //       default: Date.now()
  //     },
  //     // organizations: {
  //     //   name: {
  //     //     type: String,
  //     //     required: true
  //     //   },
  //     //   roles: [String],
  //     //   description: { type: String }
  //     // }
  //   }
  // ],
  // experience: [
  //   {
  //     role: {
  //       type: String,
  //       required: true
  //     },
  //     company: {
  //       type: String,
  //       required: true
  //     },
  //     location: { type: String },
  //     startDate: {
  //       type: Date,
  //       required: true
  //     },
  //     endDate: {
  //       type: Date,
  //       default: Date.now()
  //     },
  //     summary: { type: String }
  //   }
  // ],
});

module.exports = mongoose.model('profile', Profile);
