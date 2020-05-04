import { AccessCodeService, HubspotService } from '../services';
import accessCodeResponse from './responses/accessCode.response';

export async function getAccessCode(req, res, next) {
  try {
    const { code } = req.params;
    const accessCodeInstance = await AccessCodeService.getAccessCode(code);

    res.status(200);
    res.send(accessCodeResponse(accessCodeInstance));
  } catch (errors) {
    next(errors);
  }
}

export async function getAllAccessCodes(req, res, next) {
  try {
    const accessCodeInstances = await AccessCodeService.getAllAccessCodes();

    // TODO: WRITE RESPONSE FOR ACCESS CODES!
    res.status(200);
    res.send(accessCodeInstances);
  } catch (errors) {
    next(errors);
  }
}

export async function createAccessCode(req, res, next) {
  try {
    const { code, data, numTotalUses, expiresAt, notes } = req.body;
    const accessCodeInstance = await AccessCodeService.createAccessCode(
      code,
      data,
      numTotalUses,
      expiresAt,
      notes,
    );

    res.status(200);
    res.send(accessCodeResponse(accessCodeInstance));
  } catch (errors) {
    next(errors);
  }
}

export async function checkAccessCode(req, res, next) {
  try {
    const { code } = req.query;
    await AccessCodeService.isAccessCodeValid(code);

    res.status(200);
    res.send({ success: true });
  } catch (errors) {
    next(errors);
  }
}

export async function activateAccessCode(req, res, next) {
  try {
    const { code } = req.query;
    const codeObj = await AccessCodeService.activateAccessCode(code, req.user);

    if (codeObj.data.subscription.status === 'PILOT') {
      await HubspotService.setHubspotT4AccountStatusToFreePilot(req.user).catch(() => {});
    }

    res.status(200);
    res.send({ success: true });
  } catch (errors) {
    next(errors);
  }
}
