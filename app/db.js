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

function fetchUser(username) {
    return User.find({ username });
}

module.exports = {
    saveUser,
    fetchUser,
};
