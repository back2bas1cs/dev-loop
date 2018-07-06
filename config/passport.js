const JWTStrat = require('passport-jwt').Strategy;
// allows us to 'extract' user data
const ExtractJWT = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');

const User = require('../server/models/User.js');

const user_secret = require('./authConfig.js').USER_SECRET;

// configure passport JWT options
const ppOptions = {
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: user_secret
};

module.exports = passport => {
  passport.use(
    new JWTStrat(ppOptions, (payload, done) => {
      User.findById(payload.id)
        .then(user => user ? done(null, user) : done(null, false))
        .catch(err => console.log(err));
    })
  );
};
