require('dotenv').config();

import csv from 'csvtojson';
import { isEqual, uniq } from 'lodash';
import { CompanyService, IndustryService } from '../services';

const sourceFilePath = './source_data/t4_companies.csv';

async function reloadCompanyData() {
  const companyArray = await csv({ ignoreEmpty: true }).fromFile(sourceFilePath);
  const industries = await IndustryService.getAllIndustries();

  for (let i = 0; i < companyArray.length; i++) {
    const curItem = companyArray[i];

    const primaryIndustries = curItem['Primary Industries']
      ? JSON.parse(curItem['Primary Industries']).map((industryPath) => {
          const industryInstance = industries.find((item) => isEqual(item.path, industryPath));
          if (!industryInstance) {
            throw Error(
              `Cannot find matching industry (${industryPath}) for company on row ${i + 2}`,
            );
          }
          return industryInstance.id;
        })
      : null;

    const secondaryIndustries = curItem['Secondary Industries']
      ? JSON.parse(curItem['Secondary Industries']).map((industryPath) => {
          const industryInstance = industries.find((item) => isEqual(item.path, industryPath));
          if (!industryInstance) {
            throw Error(
              `Cannot find matching industry (${industryPath}) for company on row ${i + 2}`,
            );
          }
          return industryInstance.id;
        })
      : null;

    const companyData = {
      displayName: curItem['Display Name'],
      ref: curItem['Ref'] || null,
      website: curItem['Website'] || null,
      location: curItem['Location'] || null,
      logoCdnPath: curItem['Logo Path'] || null,
      shortDescription: curItem['Short Description'] || null,
      longDescription: curItem['Long Description'] || null,
      PrimaryIndustries: uniq(primaryIndustries),
      SecondaryIndustries: uniq(secondaryIndustries),
    };

    await CompanyService.createOrUpdateCompanyByRef(companyData);

    console.log(`Imported ${i + 1} of ${companyArray.length} rows.`);
  }

  return true;
}

reloadCompanyData()
  .catch((e) => {
    console.log(e);
  })
  .finally(process.exit);
