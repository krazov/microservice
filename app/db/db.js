const mongoose = require('mongoose');
const { mongoUri } = require('./../config/config');

mongoose
    .connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose
    .connection
    .once('open', function mongooseOpenHandler() {
        console.log('Connection to the database has been established');
    })
    .on('error', function mongooseErrorHandler() {
        console.error.bind(console, 'connection error:');
    });
