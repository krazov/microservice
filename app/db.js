const mongoose = require('mongoose');
const { mongoUser, mongoPass } = require('./config');

const db = mongoose.connection;

mongoose.connect(
    `mongodb+srv://${mongoUser}:${mongoPass}@notesapi-mp5km.mongodb.net/notes?retryWrites=true&w=majority`,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
);

db.once('open', function mongooseOpenHandler() {
    console.log('Connection to the database has been established')
});

db.on('error', function mongooseErrorHandler() {
    console.error.bind(console, 'connection error:');
});

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

const Session = mongoose.model('Session', {
    token: String,
    username: String,
    validUntil: Number,
});

function fetchUser(username, password) {
    return password
        ? User.findOne({ username, password })
        : User.findOne({ username });
}

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
    saveUser,
    fetchUser,
    saveSession,
    fetchSession,
    cancelUserSessions,
    deleteSession,
};
