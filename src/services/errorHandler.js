import { logger } from './logger';
import {
  AppException,
  AuthenticationException,
  NotFoundException,
  ValidationException,
} from '../exceptions';
import errorResponse from '../controllers/responses/error.response';

/**
 * Not found middleware
 *
 * @param {Error} err Error which was thrown
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @param {Function} next Request continue handler
 */
export async function errorHandlerMiddleware(err, req, res, next) {
  const errObject = {
    name: err.name,
    message: err.message,
    errors: err.errors,
    extra: err.extra,
    endpoint: req.url,
  };

  if (process.env.NODE_ENV === 'local') {
    console.error(err);
  }
  logger.error(errObject);

  if (err.name === ValidationException.name || err instanceof ValidationException) {
    res.status(400);
    res.json(errorResponse(err.message, err.errors));

    return;
  }

  if (err.name === AppException.name && err.code === AppException.codes.clientErrors) {
    res.status(err.httpCode || 400);
    res.json(errorResponse(err.message));

    return;
  }

  if (err.name === NotFoundException.name) {
    res.status(404);
    res.json(errorResponse(err.message));

    return;
  }

  if (err.name === AuthenticationException.name) {
    res.status(err.status);
    res.json(errorResponse(err.message));

    return;
  }

  if (err.name === AppException.name) {
    res.status(err.httpCode || 500);
    res.json(errorResponse(err.message));

    return;
  }

  res.status(500);
  res.json(errorResponse('Internal server error'));
}
