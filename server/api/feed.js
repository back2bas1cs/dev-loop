const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');

// bring in Post model
const Post = require('../models/Post.js');
// bring in Profile model so we can check user before allowing deletion of posts
const Profile = require('../models/Profile.js');

const validatePostInput = require('../validation/validatePost.js');
const { isEmptyCollection } = require('../validation/validationHelpers.js');

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
    .catch(err => {
      res.status(400).json({
        feed: 'could not post to feed',
        err
      });
    });
});

// NOTE: UNFINISHED!
// @route:  POST api/feed/:post_id
// @desc:   edit/update post (by post_id)
// @access: private
feed.post('/:post_id', passport.authenticate('jwt', { session: false }), (req, res) => {

  const { postErrors, isValidPost } = validatePostInput(req.body);

  if (!isValidPost ) {
    res.status(400).json(postErrors);
  }

  Post.findById(req.params.post_id)
    .then(postToEdit => {
      // verify that they have permission to edit the given post
      if (postToEdit.user.toString() !== req.user.id) {
        res.status(401).json({
          post: 'you do not have permission to edit this post'
        });
      } else {
        // check if post has changed (i.e. been edited)
        if (postToEdit.post !== req.body.post) {
          postToEdit.edited = true;
          postToEdit.post = req.body.post;
        }
        // save "updated post"
        postToEdit.save()
          .then(updatedPost => {
            res.status(200).json(updatedPost);
          })
          .catch(err => {
            res.status(400).json({
              post: 'could not edit post',
              err
            });
          });
      }
    })
    .catch(err => {
      res.status(404).json({
        post: 'could not find post matching that id'
      });
    });
});

// @route:  GET api/feed
// @desc:   retrieve feed (all posts)
// @access: public
feed.get('/', (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => {
      if (isEmptyCollection(posts)) {
        res.status(404).json({
          feed: 'feed is empty (i.e. no posts have been made)'
        });
      } else {
        res.status(200).json(posts);
      }
    })
  .catch(err => res.status(400).json(err));
});

// @route:  GET api/feed/:post_id
// @desc:   retrieve single post (by id)
// @access: public
feed.get('/:post_id', (req, res) => {
  Post.findById(req.params.post_id)
    .then(post => {
      if (!post) {
        res.status(404).json({
          post: 'this post has been deleted'
        });
      } else {
        res.status(200).json(post);
      }
    })
    .catch(err => {
      res.status(404).json({
        post: 'no posts were found matching that id'
      });
    });
});

// @route:  DELETE api/feed/:post_id
// @desc:   delete current (logged-in) user's post (by post_id)
// @access: private
feed.delete('/:post_id', passport.authenticate('jwt', { session: false }), (req, res) => {
  // NOTE: replace with findOneAndDelete?
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

// @route:  POST api/feed/like/:post_id
// @desc:   "like" a given post (by post_id)
// @access: private
feed.post('/like/:post_id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Post.findById(req.params.post_id)
    .then(post => {
      // check if user has already "liked" post matching post_id -- if not, add new object (with user id) to "likes" array
      if (post.likes.filter(like => {
        return like.user.toString() === req.user.id
      }).length === 0) {
        post.likes.unshift({ user: req.user.id });
        post.save()
          .then(updatedPost => {
            res.status(200).json(updatedPost);
          });
          // .catch (?)
      } else {
        // user can't like given post more than once
        res.status(400).json({
          post: 'you have already "liked" this post'
        });
      }
    })
    .catch(err => res.status(404).json({
        post: 'could not find post matching that id'
    }));
});

// @route:  POST api/feed/unlike/:post_id
// @desc:   "unlike" a given post (by post_id)
// @access: private
feed.post('/unlike/:post_id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Post.findById(req.params.post_id)
    .then(post => {
      // check if user has already given "thumbs up" to post matching post_id -- if so, remove object (with user id) from thumbs array
      if (post.likes.filter(like => {
        return like.user.toString() === req.user.id
      }).length !== 0) {
        // first, replace "thumbs" array with new array w/ "thumbs up" object by user (matching id) filtered out
        post.likes = post.likes
          .filter(like => {
            return like.user.toString() !== req.user.id
          });
        // then, save post with updated thumbs array to DB
        post.save()
          .then(updatedPost => {
            res.status(200).json(updatedPost);
          })
          .catch(err => {
            post: 'there was an issue "liking" this post',
            err
          });
      } else {
        // user can only "un-like" if they have already "liked" given post
        res.status(400).json({
          post: 'you have not "liked" this post yet'
        });
      }
    })
    .catch(err => res.status(404).json({
        post: 'could not find post matching that id'
    }));
});

// NOTE: UNFINISHED
// @route:  POST api/feed/comment/:post_id
// @desc:   add a comment to a post (by post_id)
// @access: private
feed.post('/comment/:post_id', passport.authenticate('jwt', { session: false }), (req, res) => {

  // validate comment

  Post.findById(req.params.post_id)
    .then(post => {

      let newComment = {
        user: req.user.id,
        name: req.user.name,
        avatar: req.user.avatar,
        comment: req.body.comment
      };

      post.comments.unshift(newComment);
      post.save()
        .then(savedPost => {
          res.json(savedPost)
        });
    })
    .catch(err => {
      res.status(404).json({
        post: 'could not find post matching that id'
      });
    });

});

module.exports = feed;
