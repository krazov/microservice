const bcrypt = require('bcrypt');

const saltRounds = 10;

const hashedPassword = (password) => bcrypt.hash(password, saltRounds);

module.exports = {
    hashedPassword,
};
