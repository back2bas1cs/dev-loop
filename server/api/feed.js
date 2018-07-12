const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');

const validatePostInput = require('../validation/validatePost.js');

// bring in Post model
const Post = require('../models/Post.js');
// bring in Profile model so we can check user before allowing deletion of posts
const Profile = require('../models/Profile.js');

// initialize FEED/POSTS (aka: "feed") router
const feed = express.Router();

// @route:  POST api/feed
// @desc:   add new post to feed
// @access: private
feed.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {

  const { postErrors, isValidPost } = validatePostInput(req.body);

  if (!isValidPost ) {
    res.status(400).json(postErrors);
  }

  const newPost = {
    user: req.user.id,
    name: req.user.name,
    avatar: req.user.avatar,
    post: req.body.post
  };

  // save newly constructed post
  new Post(newPost).save()
    .then(savedPost => res.status(200).json(savedPost))
  .catch(err => res.status(400).json({
    feed: 'could not post to feed',
    err
  }));
});

// @route:  GET api/feed
// @desc:   retrieve feed (all posts)
// @access: public
feed.get('/', (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => {
      res.status(200).json(posts);
    })
    .catch(err => res.status(404).json({
      feed: 'feed is empty (i.e. no posts have been made)'
    }));
});

// @route:  GET api/feed/:post_id
// @desc:   retrieve single post (by id)
// @access: public
feed.get('/:post_id', (req, res) => {
  Post.findById(req.params.post_id)
    .then(post => {
      res.status(200).json(post)
    })
    .catch(err => res.status(404).json({
      post: 'no posts were found matching that id'
    }));
});

// @route:  DELETE api/feed/:post_id
// @desc:   delete current (logged-in) user's comment
// @access: private
feed.delete('/:post_id', passport.authenticate('jwt', { session: false}), (req, res) => {
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      Post.findById(req.params.post_id)
        .then(post => {
          if (post.user.toString() === req.user.id) {
            post.remove()
              .then(removedPost => res.status(200).json(removedPost))
              .catch(err => res.status(500).json({
                post: 'there was an issue deleting this post'
              }));
          } else {
            // tell them they can't delete other people's posts
            res.status(401).json({
              post: 'you do not have permission to delete this post'
            });
          }
        })
        .catch(err => {
          res.status(404).json({
            post: 'no posts were found matching that id'
          });
        });
    });
});


// NOTE: unfinished
// @route:  POST api/feed/thumbsup/:post_id
// @desc:   give "thumbs up" to a post (by post id)
// @access: private
feed.post('/thumbsup/:post_id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      Post.findById(req.params.post_id)
        .then(post => {
          // check if user has already given "thumbs up" to post matching post_id -- if not, add new object to (with user id) to thumbs array
          if (post.thumbs.filter(thumbsup => {
            return thumbsup.user.toString() === req.user.id
          }).length === 0) {
            post.thumbs.unshift({ user: req.user.id });
            post.save()
              .then(updatedPost => {
                res.status(200).json(updatedPost);
              });
          } else {
            // user can't give more than one "thumbs up" per post
            res.status(400).json({
              post: `you've already given this post a thumb's up`
            });
          }
        })
        .catch(err => res.status(404).json({
            post: 'could not find post matching that id'
        }));
    });
});

// @route:  POST api/feed/unthumb/:post_id
// @desc:   remove "thumbs up" from a post (by post id)
// @access: private
feed.post('/unthumb/:post_id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      Post.findById(req.params.post_id)
        .then(post => {
          // check if user has already given "thumbs up" to post matching post_id -- if so, remove object (with user id) from thumbs array
          if (post.thumbs.filter(thumbsup => {
            return thumbsup.user.toString() === req.user.id
          }).length !== 0) {
            post.thumbs.filter(thumbsup => {
                return thumbsup.user.toString() !== req.user.id
            })
            post.save()
              .then(updatedPost => {
                res.status(200).json(updatedPost);
              });
          } else {
            // user can't give more than one "thumbs up" per post
            res.status(400).json({
              post: `you've already given this post a thumb's up`
            });
          }
        })
        .catch(err => res.status(404).json({
            post: 'could not find post matching that id'
        }));
    });
});

module.exports = feed;
