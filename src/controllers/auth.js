import { AuthService } from '../services';

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const { user, token } = await AuthService.login(email, password);

    res.status(200);
    res.send({ token });
  } catch (errors) {
    next(errors);
  }
}
