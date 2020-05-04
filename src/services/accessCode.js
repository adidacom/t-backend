import Sequelize from 'sequelize';
import { AccessCode } from '../db/models';
import { ValidationException, NotFoundException } from '../exceptions';

export async function createAccessCode(code, data, numTotalUses, expiresAt, notes) {
  const accessCodeData = { code, data, numTotalUses, expiresAt, notes };

  const accessCode = await AccessCode.create(accessCodeData).catch(
    Sequelize.ValidationError,
    (e) => {
      if (e.errors[0].message === 'code must be unique') {
        throw new ValidationException([], 'Access code already exists.');
      }

      throw new ValidationException([], 'Validation error.');
    },
  );
  if (!accessCode) {
    throw new AppException('Could not create access Code.');
  }

  return accessCode;
}

export async function getAccessCode(code) {
  const accessCode = await AccessCode.findOne({ where: { code } });
  if (!accessCode) {
    throw new NotFoundException('Access code not found.');
  }

  return accessCode;
}

export async function getAllAccessCodes(code) {
  const accessCodes = await AccessCode.findAll({ order: [['createdAt', 'DESC']] });
  if (!accessCodes) {
    throw new NotFoundException('Access codes not found.');
  }

  return accessCodes;
}

export async function isAccessCodeValid(code) {
  const accessCode = await getAccessCode(code);
  if (!accessCode.isValid()) {
    throw new ValidationException([], 'Access code is invalid');
  }

  return true;
}

export async function activateAccessCode(code, user) {
  const accessCode = await getAccessCode(code);
  if (!accessCode.isValid()) {
    throw new ValidationException([], 'Access code is invalid');
  }

  // TODO: Be more flexible in handling accessCode data
  const { industriesEnabled, subscription } = accessCode.data;
  if (industriesEnabled) {
    await user.update({ industriesEnabled, subscription });
  }

  return accessCode.update({
    numTimesUsed: accessCode.numTimesUsed + 1,
    UserIds: accessCode.UserIds ? [...accessCode.UserIds, user.id] : [user.id],
    datesRedeemedAt: accessCode.datesRedeemedAt
      ? [...accessCode.datesRedeemedAt, new Date()]
      : [new Date()],
  });
}
