require('dotenv').config();

import csv from 'csvtojson';
import { isEqual } from 'lodash';
import { CompanyService, IndustryService } from '../services';

const NUM_MARKET_SHARE_COMPANIES = 7;

const sourceFilePath = './source_data/t4_industries.csv';

async function reloadIndustryData() {
  const industryArray = await csv({ ignoreEmpty: true }).fromFile(sourceFilePath);

  for (let i = 0; i < industryArray.length; i++) {
    const curItem = industryArray[i];

    const industry = await IndustryService.getIndustryByPath(JSON.parse(curItem['Industry Path']));

    /* Market Share */
    const marketShareData = [];
    for (let j = 1; j < NUM_MARKET_SHARE_COMPANIES; j++) {
      const curRef = curItem[`Company${j} Ref`];
      const curName = curItem[`Company${j} Name`];
      const curShare = curItem[`Company${j} Share`];
      if (!curRef && !curName) break;

      marketShareData.push({
        ref: curRef || null,
        name: curName || null,
        share: Number(curShare),
      });
    }

    const marketShare = marketShareData.length
      ? {
          name: 'Market Share',
          description: curItem['Market Share Description'] || null,
          source: curItem['Market Share Source'] || null,
          baseYear: curItem['Market Share Base Year'] || null,
          value: marketShareData,
        }
      : null;

    const indSize = curItem['Size']
      ? {
          name: 'Industry Size',
          description: curItem['Size Description'] || null,
          source: curItem['Size Source'] || null,
          baseYear: curItem['Size Base Year'] || null,
          value: Number(curItem['Size']),
        }
      : null;

    const indGrowth = curItem['Growth']
      ? {
          name: 'Industry Growth',
          description: curItem['Growth Description'] || null,
          source: curItem['Growth Source'] || null,
          baseYear: curItem['Growth Base Year'] || null,
          value: Number(curItem['Growth']),
        }
      : null;

    const statistics = [];
    if (indSize) statistics.push(indSize);
    if (indGrowth) statistics.push(indGrowth);
    if (marketShare) statistics.push(marketShare);

    await industry.update({
      description: curItem['Description'] || null,
      statistics: statistics.length ? statistics : null,
    });

    console.log(`Imported ${i + 1} of ${industryArray.length} rows.`);
  }

  return true;
}

reloadIndustryData()
  .catch((e) => {
    console.log(e);
  })
  .finally(process.exit);
