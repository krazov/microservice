const ErrorResponse = (response, errorCode, name, message) =>
    response
        .status(errorCode)
        .json({ errorCode, name, message });

const BadRequestError = (response, { message = 'Bad request' } = {}) =>
    ErrorResponse(response, 400, 'Bad Request', message);

const UnauthorizedError = (response) =>
    ErrorResponse(response, 401, 'Unauthorized', 'Invalid session');

const ConflictError = (response, { message = 'Resubmit form with correct data' } = {}) =>
    ErrorResponse(response, 409, 'Conflict', message);

const UnprocessableEntityError = (response, { message = 'Resubmit form with correct data' } = {}) =>
    ErrorResponse(response, 422, 'Unprocessable Entity', message);

module.exports = {
    BadRequestError,
    UnauthorizedError,
    ConflictError,
    UnprocessableEntityError,
};
