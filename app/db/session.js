require('./db');
const mongoose = require('mongoose');

const Session = mongoose.model('Session', {
    token: String,
    username: String,
    validUntil: Number,
});

function saveSession(token, username, validUntil) {
    const session = new Session({
        token,
        username,
        validUntil,
    });

    return session.save();
}

function fetchSession(token) {
    return Session.findOne({ token });
}

function cancelUserSessions(username) {
    return Session.deleteMany({ username });
}

function deleteSession(token) {
    return Session.deleteOne({ token });
}

module.exports = {
    saveSession,
    fetchSession,
    cancelUserSessions,
    deleteSession,
};
