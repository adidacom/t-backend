require('dotenv').config();

import { IndustryService } from '../services';
import INDUSTRY_DASHBOARDS from '../../source_data/t4_dashboards';

async function reloadReportData() {
  console.log('Importing Industry Dashboards');
  for (let i = 0; i < INDUSTRY_DASHBOARDS.length; i++) {
    console.log(INDUSTRY_DASHBOARDS[i].industry);
    const curIndustry = await IndustryService.getIndustryByPath(INDUSTRY_DASHBOARDS[i].industry);
    await IndustryService.updateIndustry(curIndustry.id, {
      dashboard: INDUSTRY_DASHBOARDS[i].dashboard,
    });
  }
  console.log('Completed Importing Industry Dashboards');

  return true;
}

reloadReportData()
  .catch((e) => {
    console.log(e);
  })
  .finally(process.exit);
