const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');

// bring in Post model
const Post = require('../models/Post.js');
// bring in Profile model so we can check user before allowing deletion of posts
const Profile = require('../models/Profile.js');

const validatePostAndCommentInput = require('../validation/validatePostAndComment.js');
const { isEmptyCollection } = require('../validation/validationHelpers.js');

// initialize FEED/POSTS (aka: "feed") router
const feed = express.Router();

// @route:  POST api/feed
// @desc:   add new post to feed
// @access: private
feed.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {

  const { postErrors, isValidPost } = validatePostAndCommentInput(req.body);

  if (!isValidPost) {
    return res.status(400).json(postErrors);
  }

  const newPost = {
    user: req.user.id,
    name: req.user.name,
    avatar: req.user.avatar,
    text: req.body.text
  };
  // save newly constructed post
  return new Post(newPost).save()
    .then(savedPost => res.status(200).json(savedPost))
    .catch(err => res.status(500).json(err));
});

// @route:  PUT api/feed/:post_id
// @desc:   edit/update post (by post_id)
// @access: private
feed.put('/:post_id', passport.authenticate('jwt', { session: false }), (req, res) => {

  const { postErrors, isValidPost } = validatePostAndCommentInput(req.body);

  if (!isValidPost ) {
    return res.status(400).json(postErrors);
  }

  Post.findById(req.params.post_id)
    .then(postToEdit => {
      // verify that they have permission to edit the given post
      if (postToEdit.user.toString() !== req.user.id) {
        return res.status(401).json({
          post: 'you do not have permission to edit this post'
        });
      } else {
        // check if post has changed (i.e. been edited)
        if (postToEdit.text !== req.body.text) {
          postToEdit.edited = true;
          postToEdit.text = req.body.text;
        }
        // save "updated" post
        postToEdit.save()
          .then(updatedPost => res.status(200).json(updatedPost))
          .catch(err => res.status(500).json(err));
      }
    })
    .catch(err => {
      return res.status(404).json({
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
        return res.status(404).json({
          feed: 'feed is empty (i.e. no posts have been made)'
        });
      } else {
        return res.status(200).json(posts);
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
        return res.status(404).json({
          post: 'this post has been deleted'
        });
      } else {
        return res.status(200).json(post);
      }
    })
    .catch(err => {
      return res.status(404).json({
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
          .catch(err => {
            return res.status(500).json({
              post: 'there was an issue deleting this post',
              err
            });
          });
      } else {
        // tell them they can't delete other people's posts
        return res.status(401).json({
          post: 'you do not have permission to delete this post'
        });
      }
    })
    .catch(err => {
      return res.status(404).json({
        post: 'no posts were found matching that id'
      });
    });
});

// @route:  PUT api/feed/like/:post_id
// @desc:   "like" a given post (by post_id)
// @access: private
feed.put('/like/:post_id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Post.findById(req.params.post_id)
    .then(post => {
      // check if user has already "liked" post matching post_id -- if not, add new object (with user id) to "likes" array
      if (post.likes.filter(like => {
        return like.user.toString() === req.user.id
      }).length === 0) {
        post.likes.unshift({ user: req.user.id });
        post.save()
          .then(updatedPost => {
            return res.status(200).json(updatedPost);
          });
          // .catch (?)
      } else {
        // user can't "like" given post more than once
        return res.status(400).json({
          post: 'you have already "liked" this post'
        });
      }
    })
    .catch(err => {
      return res.status(404).json({
        post: 'could not find post matching that id'
      });
    });
});

// @route:  PUT api/feed/unlike/:post_id
// @desc:   "unlike" a given post (by post_id)
// @access: private
feed.put('/unlike/:post_id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Post.findById(req.params.post_id)
    .then(post => {
      // check if user has already "liked" post matching post_id -- if so, remove object (with user id) from "likes" array
      if (post.likes.filter(like => {
        return like.user.toString() === req.user.id;
      }).length !== 0) {
        // first, replace "likes" array with new array w/ "like" object by user (matching id) filtered out
        post.likes = post.likes
          .filter(like => {
            return like.user.toString() !== req.user.id;
          });
        // then, save post with updated "likes" array to DB
        post.save()
          .then(updatedPost => {
            return res.status(200).json(updatedPost);
          })
          .catch(err => {
            return res.status(500).json({
              post: 'there was an issue "un-liking" this post',
              err
            });
          });
      } else {
        // user can only "un-like" if they have already "liked" given post
        return res.status(400).json({
          post: 'you have not "liked" this post yet'
        });
      }
    })
    .catch(err => {
      return res.status(404).json({
        post: 'could not find post matching that id'
      });
    });
});

// @route:  PUT api/feed/comment/:post_id
// @desc:   add a comment to a post (by post_id)
// @access: private
feed.put('/comment/:post_id', passport.authenticate('jwt', { session: false }), (req, res) => {

  // validate comment post
  const { postErrors, isValidPost } = validatePostAndCommentInput(req.body);

  if (!isValidPost) {
    return res.status(400).json(postErrors);
  }

  Post.findById(req.params.post_id)
    .then(post => {
      // initialize new comment
      let newComment = {
        user: req.user.id,
        name: req.user.name,
        avatar: req.user.avatar,
        text: req.body.text
      };
      // add new comment object to END of "comments" array
      post.comments.push(newComment);
      post.save()
        .then(savedPost => res.status(200).json(savedPost))
        .catch(err => {
          return res.status(500).json({
            post: 'there was an issue posting this comment',
            err
          });
        });
    })
    .catch(err => {
      return res.status(404).json({
        post: 'could not find post matching that id'
      });
    });
});

// @route:  DELETE api/feed/:post_id/:comment_id
// @desc:   delete given comment from given post (by post_id AND comment_id)
// @access: private
feed.delete('/:post_id/:comment_id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Post.findById(req.params.post_id)
    .then(post => {
      // NOTE:change this logic so that we're checking for
      // matching user id AND comment id
      if (post.comments.filter(comment => {
        return comment.user.toString() === req.user.id &&
          comment.id === req.params.comment_id;
      }).length !== 0) {
        // replace "comments" array with new array w/"comment" object by user (matching id) filtered out
        post.comments = post.comments
          .filter(comment => {
            return comment.id !== req.params.comment_id;
          });
        // then, save post with updated "comments" array to DB
        post.save()
          .then(updatedPost => res.status(200).json(updatedPost))
          .catch(err => {
            return res.status(500).json({
              post: 'there was an issue deleting your comment from this post',
              err
            });
          });
      } else {
        // user can only delete comment if it exists
        return res.status(400).json({
          comment: 'could not find comment matching that id'
        });
      }
    })
    .catch(err => {
      return res.status(404).json({
        post: 'could not find post matching that id'
      });
    });
});

module.exports = feed;
