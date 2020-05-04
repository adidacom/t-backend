require('dotenv').config();

import csv from 'csvtojson';
import { IndustryService, PublisherService, ReportBranchService, ReportService } from '../services';
import { deleteReportData, deleteCompanyData, deleteIndustryData } from './dbHelper';
import INDUSTRY_DASHBOARDS from '../../source_data/t4_dashboards';

const sourceFilePath = './source_data/t4_report_branches.csv';

async function reloadReportData() {
  await deleteReportData();
  await deleteIndustryData();
  await deleteCompanyData();

  const reportsArray = await csv({ ignoreEmpty: true }).fromFile(sourceFilePath);

  for (let i = 0; i < reportsArray.length; i++) {
    const reportLine = reportsArray[i];

    // Create or retrieve publisher
    const publisherData = {
      name: reportLine['Publisher'],
      description: reportLine['Publisher Description'] || null,
      quality: reportLine['Report Quality'],
    };
    const publisher = await PublisherService.createOrRetrievePublisher(publisherData);

    // Create or retrieve report
    const reportData = {
      name: reportLine['Report Name'],
      url: reportLine['Report Link'],
      description: reportLine['Report Description'],
      datePublished:
        reportLine['Report Last Published'] === 'Current'
          ? null
          : new Date(reportLine['Report Last Published']),
      quality: reportLine['Report Quality'],
      price: reportLine['Price'],
      updateFrequency: reportLine['Report Update Frequency']
        ? reportLine['Report Update Frequency'].toLowerCase()
        : null,
    };
    const report = await ReportService.createOrRetrieveReport(reportData, publisher);

    // Create of retrieve industry
    const industryPath = [reportLine['Sector']];
    if (reportLine['SubIndustry1']) industryPath.push(reportLine['SubIndustry1']);
    if (reportLine['SubIndustry2']) industryPath.push(reportLine['SubIndustry2']);
    if (reportLine['SubIndustry3']) industryPath.push(reportLine['SubIndustry3']);
    if (reportLine['SubIndustry4']) industryPath.push(reportLine['SubIndustry4']);
    if (reportLine['SubIndustry5']) industryPath.push(reportLine['SubIndustry5']);
    if (reportLine['SubIndustry6']) industryPath.push(reportLine['SubIndustry6']);
    if (reportLine['SubIndustry7']) industryPath.push(reportLine['SubIndustry7']);
    if (reportLine['SubIndustry8']) industryPath.push(reportLine['SubIndustry8']);
    if (reportLine['SubIndustry9']) industryPath.push(reportLine['SubIndustry9']);
    const industry = await IndustryService.createOrRetrieveIndustry({ path: industryPath });

    // Create or retrieve report branches
    const reportBranchData = {
      industry: industryPath,
      metric: reportLine['Metric'],
      timeUnit: reportLine['Time Unit'].toUpperCase(),
      timeFrom: new Date(reportLine['From']),
      timeTo: new Date(reportLine['To']),
      dataUnit: reportLine['Data Unit'],
      unitDescription: reportLine['Unit Description'],
      regions: reportLine['Region'] ? reportLine['Region'].split(/,\s*/) : [],
      page: reportLine['Page'] || null,
      catalogerNotes: reportLine['Cataloger Notes'],
      completeness: reportLine['Completeness'],
      data: { message: reportLine['Written Explanation'] },
    };

    reportBranchData.segmentation = [];
    if (reportLine['Segment1']) reportBranchData.segmentation.push(reportLine['Segment1']);
    if (reportLine['Segment2']) reportBranchData.segmentation.push(reportLine['Segment2']);
    if (reportLine['Segment3']) reportBranchData.segmentation.push(reportLine['Segment3']);
    if (reportLine['Segment4']) reportBranchData.segmentation.push(reportLine['Segment4']);
    if (reportLine['Segment5']) reportBranchData.segmentation.push(reportLine['Segment5']);
    if (reportLine['Segment6']) reportBranchData.segmentation.push(reportLine['Segment6']);

    // TODO: Remove this temporary fix!
    if (reportBranchData.timeUnit === 'HALF') reportBranchData.timeUnit = 'YEAR';

    await ReportBranchService.createOrRetrieveReportBranch(reportBranchData, report, industry);

    console.log(`Imported ${i + 1} of ${reportsArray.length} rows.`);
  }

  await IndustryService.saturateIndustryTree();

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
