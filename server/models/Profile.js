const mongoose = require('mongoose');

const Schema = mongoose.Schema;


// build/initialize PROFILE schema
const Profile = new Schema({

});

module.exports = mongoose.model('profile', Profile);
