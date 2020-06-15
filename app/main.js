const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuid } = require('uuid');

const {
    saveUser,
    fetchUser,
} = require('./db/user');
const {
    saveSession,
    fetchSession,
    cancelUserSessions,
    deleteSession,
} = require('./db/session');
const {
    fetchNotes,
    addNote,
    fetchNote,
    updateNote,
    deleteNote,
} = require('./db/notes');
const { p } = require('./utils/html.utils');
const {
    requestTime,
    requestLogger,
    sessionToken,
    userRequestData,
    bodyNote,
    paramId,
    timeDiff,
} = require('./utils/utils');
const {
    hashedPassword,
    isMatchingPassword,
} = require('./utils/hash.utils');
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

app.post('/register', async function register(request, response) {
    const { login, password, passwordRepeated } = userRequestData(request, { isRegistration: true });

    const isExistingUser = (await fetchUser(login)).length > 0;
    if (isExistingUser) {
        return ConflictError(response, { message: `User already exists` });
    }

    const isEmptyOrMismatchedPassword = password === undefined || password != passwordRepeated;
    if (isEmptyOrMismatchedPassword) {
        return UnprocessableEntityError(response, { message: 'Mismatched or empty password' })
    }

    const safePassword = await hashedPassword(password);
    await saveUser(login, safePassword);

    return response.json({
        message: `You have registered`,
        username: login,
        password: '•'.repeat(password.length),
    });
});

app.post('/login', async function login(request, response) {
    const { login, password } = userRequestData(request);

    const user = await fetchUser(login);
    const isWrongLoginOrPassword = !user || !(await isMatchingPassword(password, user.password));
    if (isWrongLoginOrPassword) {
        return UnprocessableEntityError(response, { message: 'Wrong username or password' });
    }

    await cancelUserSessions(login);

    const sessionToken = uuid();
    const validUntil = timeDiff(request.requestTime, 5);

    await saveSession(sessionToken, login, validUntil);

    return response.json({
        message: `You have logged in`,
        token: sessionToken,
    });
});

app.get('/logout', async function logout(request, response) {
    const token = sessionToken(request);

    const isLoggedInUser = await fetchSession(token);
    if (isLoggedInUser) {
        await deleteSession(token);
    }

    return response.json({
        message: 'User has been logged out',
    });
});

app.get('/notes', async function getNotes(request, response) {
    const token = sessionToken(request);
    const user = await fetchSession(token);
    const isLoggedOutUser = user === null;

    if (isLoggedOutUser) {
        return UnauthorizedError(response);
    }

    return response.json(await fetchNotes(user.username));
});

// TODO: idempotency
app.post('/note', async function postNote(request, response) {
    const token = sessionToken(request);
    const session = await fetchSession(token);
    const isLoggedOutUser = session === null;

    if (isLoggedOutUser) {
        return UnauthorizedError(response);
    }

    const user = await fetchUser(session.username);

    const id = uuid();
    const note = bodyNote(request);

    await addNote(id, user.username, request.requestTime, note);

    return response.json({
        message: `Note has been added`,
        id,
        note,
    });
});

app.get('/note/:id', async function getNote(request, response) {
    const token = sessionToken(request);
    const session = await fetchSession(token);
    const isLoggedOutUser = session === null;

    if (isLoggedOutUser) {
        return UnauthorizedError(response);
    }

    const id = paramId(request);

    return response.json(await fetchNote(id));
});

// TODO: do not allow any user to perform an operation on any note ;)
app.put('/note/:id', async function putNote(request, response) {
    const token = sessionToken(request);
    const session = await fetchSession(token);
    const isLoggedOutUser = session === null;

    if (isLoggedOutUser) {
        return UnauthorizedError(response);
    }

    const id = paramId(request);
    const note = bodyNote(request);

    await updateNote(id, Date.now(), note);

    return response.json({
        message: `Note has been updated`,
        id,
        note,
    });
});

// TODO: do not allow any user to perform an operation on any note ;)
app.delete('/note/:id', async function deleteNotes(request, response) {
    const token = sessionToken(request);
    const session = await fetchSession(token);
    const isLoggedOutUser = session === null;

    if (isLoggedOutUser) {
        return UnauthorizedError(response);
    }

    const id = paramId(request);
    await deleteNote(id);

    return response.json({
        message: `Note has been deleted`,
        id,
    });
});

app.listen(port, function listener() {
    console.log(`Notes app listening at http://localhost:${port}`);
});
