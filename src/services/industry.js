import Sequelize from 'sequelize';
import { isEqual } from 'lodash';
import { Industry } from '../db/models';
import { AppException, ValidationException, NotFoundException } from '../exceptions';

export async function createIndustry(industryData) {
  const industry = await Industry.create({
    ...industryData,
    name: industryData.path[industryData.path.length - 1],
  }).catch(Sequelize.ValidationError, (e) => {
    if (e.errors[0].message === 'path must be unique') {
      throw new ValidationException([], 'Industry with this name already exists.');
    }

    throw new ValidationException([], 'Validation error.');
  });
  if (!industry) {
    throw new AppException('Could not create industry.');
  }

  return industry;
}

export async function createOrRetrieveIndustry(industryData) {
  const industry = await Industry.findOne({ where: industryData });
  if (!industry) {
    return createIndustry(industryData);
  }

  return industry;
}

export async function getIndustryById(id) {
  const industry = await Industry.findByPk(id);
  if (!industry) {
    throw new NotFoundException('Industry not found.');
  }

  return industry;
}

export async function getIndustriesById(ids) {
  const industries = await Industry.findAll({ where: { id: ids } });
  if (!industries) {
    throw new NotFoundException('Industry not found.');
  }

  return industries;
}

export async function getIndustryByPath(path) {
  const industry = await Industry.findOne({ where: { path } });
  if (!industry) {
    throw new NotFoundException('Industry not found.');
  }

  return industry;
}

export async function getAllIndustries() {
  const industries = await Industry.findAll({ raw: true });

  return industries;
}

export async function updateIndustry(industryId, industryData) {
  const industry = await Industry.findByPk(industryId);
  if (!industry) {
    throw new NotFoundException('Industry not found.');
  }

  await industry.update(industryData).catch(() => {
    throw new AppException('Could not update industry.');
  });

  return industry;
}

// Fills in any missing nodes in industry tree that are not explicitely
// references in report branches
export async function saturateIndustryTree() {
  const initIndustryPaths = (await Industry.findAll({ attributes: ['path'], raw: true })).map(
    (item) => item.path,
  );

  const newIndustryPaths = [];
  for (let i = 0; i < initIndustryPaths.length; i++) {
    const industryPath = initIndustryPaths[i];
    for (let j = 1; j < industryPath.length + 1; j++) {
      const path = industryPath.slice(0, j);
      const isNewPath = !initIndustryPaths.find((item) => isEqual(item, path));
      const pathAlreadyFound = !isNewPath || !!newIndustryPaths.find((item) => isEqual(item, path));
      if (!pathAlreadyFound) newIndustryPaths.push(path);
    }
  }

  const newIndustries = [];
  for (let i = 0; i < newIndustryPaths.length; i++) {
    const newIndustry = await createIndustry({ path: newIndustryPaths[i] });
    newIndustries.push(newIndustry);
  }

  return newIndustries;
}
