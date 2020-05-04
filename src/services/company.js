import Sequelize from 'sequelize';
import { Company } from '../db/models';
import { getIndustriesById } from './industry';
import { AppException, ValidationException, NotFoundException } from '../exceptions';

// ! Mutable function
async function loadIndustries(company) {
  if (company.PrimaryIndustries) {
    company.PrimaryIndustries = await getIndustriesById(company.PrimaryIndustries);
  }

  if (company.SecondaryIndustries) {
    company.SecondaryIndustries = await getIndustriesById(company.SecondaryIndustries);
  }

  return company;
}

export async function createCompany(companyData) {
  const company = await Company.create(companyData).catch(Sequelize.ValidationError, (e) => {
    if (e.errors[0].message === 'path must be unique') {
      throw new ValidationException([], 'Company with this name already exists.');
    }

    throw new ValidationException([], 'Validation error.');
  });
  if (!company) {
    throw new AppException('Could not create company.');
  }

  return company;
}

export async function createOrRetrieveCompany(companyData) {
  const company = await Company.findOne({ where: companyData });
  if (!company) {
    return createCompany(companyData);
  }

  return company;
}

export async function updateCompany(companyData) {
  const company = await Company.findByPk(companyData.id);
  if (!company) {
    throw new NotFoundException('Company not found.');
  }

  await company.update(companyData).catch(() => {
    throw new AppException('Could not update company.');
  });

  return company;
}

export async function createOrUpdateCompanyByRef(companyData) {
  const company = await Company.findOne({ where: { ref: companyData.ref } });
  if (!company) {
    return createCompany(companyData);
  }

  return updateCompany(company);
}

export async function getCompanyById(id) {
  const company = await Company.findByPk(id);
  if (!company) {
    throw new NotFoundException('Company not found.');
  }

  await loadIndustries(company);

  return company;
}

export async function getCompanyByRef(ref) {
  const company = await Company.findOne({ where: { ref } });
  if (!company) {
    throw new NotFoundException('Company not found.');
  }

  await loadIndustries(company);

  return company;
}

export function getAllCompanies() {
  return Company.findAll();
}
