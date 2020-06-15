const express = require('express');
const app = express();
const port = 3000;

const { p } = require('./html');

app.use(logRequestedTime);

app.get('/', function mainRoute(request, response) {
    response.send(p('Hello world.') + p('Requested at: ' + request.requestTime));
});

app.listen(port, function listener() {
    console.log(`Example app listening at http://localhost:${port}`);
});

function logRequestedTime(request, response, next) {
    request.requestTime = Date.now();
    next();
}