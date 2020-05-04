import { Strategy, ExtractJwt } from 'passport-jwt';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { User } from '../db/models';
import { USER_ROLES } from '../db/helpers/dbEnums';
import { AppException, AuthenticationException } from '../exceptions';
import { JWT_TOKEN_EXPIRES_IN } from '../config';

const JWT_SECRET = process.env.JWT_SECRET;
const NO_AUTH_MESSAGE = 'No auth token';

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET,
};

export function JwtStrategy() {
  return new Strategy(opts, async (jwtPayload, done) => {
    const user = await User.findOne({
      where: { id: jwtPayload.id, email: jwtPayload.email },
    }).catch((e) => {
      return done(e, false);
    });

    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  });
}

export function jwtToken(user, secret = JWT_SECRET, expiresIn = JWT_TOKEN_EXPIRES_IN) {
  return jwt.sign({ id: user.id, email: user.email }, secret, { expiresIn });
}

export async function login(email, password) {
  const user = await User.findOne({ where: { email: email.toLowerCase() } });

  if (!user) {
    throw new AuthenticationException('Email not found.');
  }

  if (!user.passwordHash) {
    throw new AuthenticationException('Password has not yet been created.');
  }

  const passwordCorrect = await user.checkPassword(password);

  if (!passwordCorrect) {
    throw new AuthenticationException('Invalid login credentials.');
  }

  return {
    user,
    token: jwtToken(user),
  };
}

export function authMiddleware(req, res, next) {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    let error = err;

    if (info instanceof Error) {
      error = info;
    }

    if (error && error.message === NO_AUTH_MESSAGE) {
      return next(new AuthenticationException(error.message, 403));
    }

    if (error && !(error instanceof AppException)) {
      switch (error.name) {
        case 'TokenExpiredError':
          error = new AuthenticationException('Your token is expired.');
          break;
        case 'JsonWebTokenError':
          error = new AuthenticationException('Your token is invalid. Please provide valid token.');
          break;
        default:
          error = new AppException(error.message);
      }

      return next(error);
    }

    req.logIn(user, (errorObject) => {
      if (errorObject) {
        return next(new AppException(errorObject.message));
      }

      next();
    });
  })(req, res, next);
}

export function isAdminMiddleware(req, res, next) {
  const { user } = req;

  if (user.role !== USER_ROLES.ADMIN) {
    return next(new AuthenticationException('You are not allowed to access this function.'));
  }

  next();
}
