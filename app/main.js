const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuid } = require('uuid');

const { p } = require('./html');
const {
    requestTime,
    requestLogger,
    sessionToken,
    userRequestData,
    bodyNote,
    paramId,
    timeDiff,
} = require('./utils');
const {
    UnauthorizedError,
    ConflictError,
    UnprocessableEntityError,
} = require('./errors');

const app = express();
const port = 3000;

const users = {};
const sessions = {};

app.use(bodyParser.json());
app.use(requestTime);
app.use(requestLogger);

app.get('/', function mainRoute(request, response) {
    return response.send(p('Nothing to see here, move along.') + p('Requested at: ' + request.requestTime));
});

app.post('/', function (request, response) {
    return response.json({
        message: 'Endpoints: register (post), login (post), logout (get), note (post, get, put, delete), notes get)',
    });
});

app.post('/register', function register(request, response) {
    const { login, password, passwordRepeated } = userRequestData(request, { isRegistration: true });

    const isExistingUser = users[login];
    if (isExistingUser) {
        return ConflictError(response, { message: `User already exists` });
    }

    const isEmptyOrMismatchedPassword = password === undefined || password != passwordRepeated;
    if (isEmptyOrMismatchedPassword) {
        return UnprocessableEntityError(response, { message: 'Mismatched or empty password' })
    }

    users[login] = {
        // TODO: hash it or something, maybe even salt it
        password,
        notes: {},
    };

    return response.json({
        message: `You have registered`,
        username: login,
        password: '•'.repeat(password.length),
    });
});

app.post('/login', function login(request, response) {
    const { login, password } = userRequestData(request);

    const isWrongLoginOrPassword = !users[login] || users[login].password != password;
    if (isWrongLoginOrPassword) return response.send(`Error: Wrong username or password.`);

    const sessionToken = uuid();
    const validUntil = timeDiff(request.requestTime + 5);

    sessions[sessionToken] = {
        username: login,
        validUntil,
    };

    return response.json({
        message: `You have logged in`,
        token: sessionToken,
    });
});

app.get('/logout', function logout(request, response) {
    const token = sessionToken(request);

    const isLoggedInUser = sessions[token];
    if (isLoggedInUser) delete sessions[token];

    return response.json({
        message: 'User has been logged out',
    });
});

app.get('/notes', function getNotes(request, response) {
    const token = sessionToken(request);

    const session = sessions[token];
    const isLoggedOutUser = session === undefined;
    if (isLoggedOutUser) return UnauthorizedError(response);

    const notes = users[session.username].notes;

    return response.send(JSON.stringify(Object.values(notes)));
});

// TODO: idempotency
app.post('/note', function postNote(request, response) {
    const token = sessionToken(request);
    const session = sessions[token];
    const isLoggedOutUser = session === undefined;

    if (isLoggedOutUser) return UnauthorizedError(response);

    const id = uuid();
    const note = bodyNote(request);

    users[session.username].notes[id] = {
        id,
        created: request.requestTime,
        modified: [],
        note,
    };

    return response.json({
        message: `Note has been added`,
        id,
        note,
    });
});

app.get('/note/:id', function getNote(request, response) {
    const token = sessionToken(request);
    const session = sessions[token];
    const isLoggedOutUser = session === undefined;

    if (isLoggedOutUser) return UnauthorizedError(response);

    const id = paramId(request);
    const note = users[session.username].notes[id];

    return response.json(note);
});

app.put('/note/:id', function putNote(request, response) {
    const token = sessionToken(request);
    const session = sessions[token];
    const isLoggedOutUser = session === undefined;

    if (isLoggedOutUser) return UnauthorizedError(response);

    const id = paramId(request);
    const item = users[session.username].notes[id];

    item.note = bodyNote(request);
    item.modified.push(Date.now());

    return response.json({
        message: `Note has been updated`,
        id,
        note: item.note,
    });
});

app.delete('/note/:id', function deleteNotes(request, response) {
    const token = sessionToken(request);
    const session = sessions[token];
    const isLoggedOutUser = session === undefined;

    if (isLoggedOutUser) return UnauthorizedError(response);

    const id = paramId(request);
    delete users[session.username].notes[id];

    return response.json({
        message: `Note has been deleted`,
        id,
    });
});

app.listen(port, function listener() {
    console.log(`Notes app listening at http://localhost:${port}`);
});