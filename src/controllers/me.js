import { IndustryService } from '../services';
import meResponse from './responses/me.response';

export async function whoami(req, res, next) {
  try {
    const user = req.user;
    const { industriesEnabled } = user;
    let dashboard;
    if (industriesEnabled[0].length) {
      const primaryIndustry = await IndustryService.getIndustryByPath(industriesEnabled[0]);
      dashboard = primaryIndustry.dashboard;
    }
    res.status(200);
    res.send(meResponse(user, dashboard));
  } catch (errors) {
    next(errors);
  }
}
