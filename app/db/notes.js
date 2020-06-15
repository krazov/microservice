require('./db');
const mongoose = require('mongoose');

// TODO: remove `Note` and `note` duplication because it’s confusing
const Note = mongoose.model('Note', {
    id: String,
    created: Number,
    modified: Array,
    username: String,
    note: {},
});

function fetchNotes(username) {
    return Note.find({ username });
}

function addNote(id, username, created, note) {
    const newNote = new Note({
        id,
        created,
        modified: [],
        username,
        note,
    });

    return newNote.save();
}

function fetchNote(id) {
    return Note.findOne({ id });
}

function updateNote(id, modified, note) {
    return Note.updateOne({ id }, { note, $push: { modified }});
}

function deleteNote(id) {
    return Note.deleteOne({ id });
}

module.exports = {
    fetchNotes,
    addNote,
    fetchNote,
    updateNote,
    deleteNote,
};
