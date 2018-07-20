const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Post = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  },
  // include name and avatar here (instead of "populating" upon accessing)
  // so user posts/comments aren't deleted with their accounts
  name: { type: String },
  avatar: { type: String },
  text: {
    type: String,
    min: 12,
    max: 400,
    required: true
  },
  edited: {
    type: Boolean,
    default: false
  },
  date: {
    type: Date,
    default: Date.now
  },
  likes: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
      }
    }
  ],
  comments: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
      },
      name: { type: String },
      avatar: { type: String },
      text: {
        type: String,
        min: 8,
        max: 250,
        required: true
      },
      date: {
        type: Date,
        default: Date.now
      },
      likes: [
        {
          user: {
            type: Schema.Types.ObjectId,
            ref: 'user'
          }
        }
      ]
    }
  ]
});

module.exports = mongoose.model('post', Post);
