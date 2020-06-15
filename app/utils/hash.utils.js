const bcrypt = require('bcrypt');

const saltRounds = 10;

const hashedPassword = (password) => bcrypt.hash(password, saltRounds);

const isMatchingPassword = (password, hash) => bcrypt.compare(password, hash);

module.exports = {
    hashedPassword,
    isMatchingPassword,
};
