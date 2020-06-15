const UnauthorizedError = (response) =>
    response
        .status(401)
        .json({
            errorCode: 401,
            name: 'Unauthorized',
            message: 'Invalid session token',
        });

module.exports = {
    UnauthorizedError,
};
