import industryResponse from './industry.response';

export function companyResponse(company) {
  const { PrimaryIndustries, SecondaryIndustries } = company;

  let resPrimaryIndustries = null;
  let resSecondaryIndustries = null;

  if (PrimaryIndustries) {
    resPrimaryIndustries = PrimaryIndustries.map((industry) => industryResponse(industry));
  }

  if (SecondaryIndustries) {
    resSecondaryIndustries = SecondaryIndustries.map((industry) => industryResponse(industry));
  }

  return {
    id: company.id,
    ref: company.ref,
    displayName: company.displayName,
    legalName: company.legalName,
    website: company.website,
    logoCdnPath: company.logoCdnPath,
    shortDescription: company.shortDescription,
    longDescription: company.longDescription,
    PrimaryIndustries: resPrimaryIndustries,
    SecondaryIndustries: resSecondaryIndustries,
  };
}

export function companyListForSearchingResponse(list) {
  return list.map((company) => {
    return {
      id: company.id,
      ref: company.ref,
      displayName: company.displayName,
      logoCdnPath: company.logoCdnPath,
    };
  });
}
