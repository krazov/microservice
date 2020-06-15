function requestTime(request, response, next) {
    request.requestTime = Date.now();
    next();
}

function requestLogger(request, response, next) {
    const { headers, params, query, body } = request;
    console.log('Headers:');
    console.log(JSON.stringify(headers));
    if (Object.keys(params).length) {
        console.log('-');
        console.log('Params:');
        console.log(JSON.stringify(params));
    }
    if (Object.keys(query).length) {
        console.log('-');
        console.log('Query:');
        console.log(JSON.stringify(query));
    }
    if (Object.keys(body).length) {
        console.log('-');
        console.log('Body:');
        console.log(JSON.stringify(body));
    }
    console.log('---');
    next();
}

const sessionToken = ({
    headers: {
        'x-api-key': token,
    } = {},
} = {}) => token;

const userRequestData = ({
    body: {
        login,
        password,
        passwordRepeated,
    } = {},
} = {}, { isRegistration = false } = {}) => ({
    login,
    password,
    ...(isRegistration ? { passwordRepeated } : null),
});

const bodyNote = ({
    body: {
        note,
    } = {},
} = {}) => note;

const paramId = ({
    params: {
        id,
    } = {},
} = {}) => id;

const seconds = (t) => t * 1000;
const minutes = (t) => t * seconds(60);
const hours = (t) => t * minutes(60);

const timeDiff = (timestamp, t) => timestamp + minutes(t);

module.exports = {
    requestTime,
    requestLogger,
    userRequestData,
    bodyNote,
    paramId,
    sessionToken,
    timeDiff,
};
