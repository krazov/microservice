require('./db');
const mongoose = require('mongoose');

// TODO: start using ObjectId
const User = mongoose.model('User', {
    username: String,
    password: String,
    notes: Object,
});

function saveUser(username, password) {
    const user = new User({
        username,
        password,
        notes: {},
    });

    return user.save();
}

function fetchUser(username) {
    return User.findOne({ username });
}

module.exports = {
    saveUser,
    fetchUser,
};

