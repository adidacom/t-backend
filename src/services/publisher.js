import Sequelize from 'sequelize';
import { Publisher } from '../db/models';
import { AppException, ValidationException, NotFoundException } from '../exceptions';
import { keepKeys } from '../utilities/tools';

const UPDATABLE_PUBLISHER_KEYS = ['name', 'description', 'quality'];

export async function createPublisher(publisherData) {
  const publisher = await Publisher.create(publisherData).catch(Sequelize.ValidationError, (e) => {
    if (e.errors[0].message === 'name must be unique') {
      throw new ValidationException([], 'Publisher with this name already exists.');
    }

    throw new ValidationException([], 'Validation error.');
  });
  if (!publisher) {
    throw new AppException('Could not create publisher.');
  }

  return publisher;
}

export async function createOrRetrievePublisher(publisherData) {
  const publisher = await Publisher.findOne({ where: publisherData });
  if (!publisher) {
    return createPublisher(publisherData);
  }

  return publisher;
}

export async function getPublisherById(publisherId) {
  const publisher = await Publisher.findByPk(publisherId);
  if (!publisher) {
    throw new NotFoundException('Publisher not found.');
  }

  return publisher;
}

export async function getPublisherByName(publisherName) {
  const publisher = await Publisher.findOne({ where: { name: publisherName } });
  if (!publisher) {
    throw new NotFoundException('Publisher not found.');
  }

  return publisher;
}

export async function updatePublisher(publisherId, publisherData) {
  const publisher = await Publisher.findByPk(publisherId);
  if (!publisher) {
    throw new NotFoundException('Publisher not found.');
  }

  const cleanPublisherData = keepKeys(publisherData, UPDATABLE_PUBLISHER_KEYS);
  await publisher.update(cleanPublisherData).catch(() => {
    throw new AppException('Could not update publisher.');
  });

  return publisher;
}
