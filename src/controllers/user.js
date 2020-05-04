import {
  EmailService,
  HubspotService,
  SlackT4BotService,
  UserService,
  ZendeskService,
} from '../services';
import meResponse from './responses/me.response';

export async function signUp(req, res, next) {
  try {
    const { email, password } = req.body;

    const existingUser = await UserService.getUserByEmail(email);
    if (existingUser) {
      const { id, passwordHash } = existingUser;
      if (!passwordHash) {
        const { token } = await UserService.setFirstPasswordAndAgreeToTerms(id, password);
        await HubspotService.setHubspotT4AccountStatusToFreeTrial(existingUser);
        res.status(200);
        res.send({ token });
        return;
      }
    }

    const { user, token } = await UserService.signUp(email, password);
    await HubspotService.setHubspotT4AccountStatusToFreeTrial(user);
    SlackT4BotService.postNewUserSlackMessage(email);

    res.status(200);
    res.send({ token, newSignup: true });
  } catch (errors) {
    next(errors);
  }
}

export async function signUpWithEmailOnly(req, res, next) {
  try {
    const { email } = req.body;
    const uriEncodedEmail = encodeURIComponent(email);

    const existingUser = await UserService.getUserByEmail(email);

    if (existingUser) {
      const { id, passwordHash } = existingUser;
      let redirect;

      if (!passwordHash) {
        // Users without password created
        redirect = `${process.env.FRONTEND_URL}/signup?u=${uriEncodedEmail}`;
      } else {
        // Users with password created
        redirect = `${process.env.FRONTEND_URL}/login?u=${uriEncodedEmail}`;
      }

      res.status(200);
      res.send({ id, email, redirect });
      return;
    }

    const { user } = await UserService.signUpWithEmailOnly(email);
    const redirect = `${process.env.FRONTEND_URL}/signup?u=${uriEncodedEmail}`;
    SlackT4BotService.postEmailSignUpSlackMessage(email);

    res.status(200);
    res.send({ id: user.id, email, redirect });
  } catch (errors) {
    next(errors);
  }
}

export async function resendVerificationEmail(req, res, next) {
  try {
    const { user } = req;

    await UserService.resendVerificationEmail(user);

    res.status(200);
    res.send({ success: true });
  } catch (errors) {
    next(errors);
  }
}

export async function verifyEmail(req, res, next) {
  try {
    const { user } = req;
    const { emailVerificationCode } = req.body;

    await UserService.verifyEmail(user, emailVerificationCode);

    res.status(200);
    res.send({ success: true });
  } catch (errors) {
    next(errors);
  }
}

export async function changePassword(req, res, next) {
  try {
    const { oldPassword, newPassword } = req.body;
    await UserService.changePassword(req.user.id, oldPassword, newPassword);

    res.status(200);
    res.send({ success: true });
  } catch (errors) {
    next(errors);
  }
}

export async function generateResetPasswordToken(req, res, next) {
  try {
    const { email } = req.body;
    await UserService.generateResetPasswordToken(email);

    res.status(200);
    res.send({ success: true });
  } catch (errors) {
    next(errors);
  }
}

export async function checkResetPasswordToken(req, res, next) {
  try {
    const { token } = req.query;
    await UserService.checkResetPasswordToken(token);

    res.status(200);
    res.send({ success: true });
  } catch (errors) {
    next(errors);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { email, password, token } = req.body;
    await UserService.resetPassword(email, password, token);

    res.status(200);
    res.send({ success: true });
  } catch (errors) {
    next(errors);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const user = await UserService.updateProfile(req.user.id, req.body);

    await HubspotService.updateHubspotContactT4AppUsage(user);

    res.status(200);
    res.send(meResponse(user));
  } catch (errors) {
    next(errors);
  }
}

export async function createSupportTicket(req, res, next) {
  try {
    const { user } = req;
    const { subject, description } = req.body;

    ZendeskService.createSupportTicket(user, subject, description);
    EmailService.sendRequestReceivedEmail(user.email);

    res.status(200);
    res.send({ success: true });
  } catch (errors) {
    next(errors);
  }
}
