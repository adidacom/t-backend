import Sequelize from 'sequelize';
import { Report, ReportBranch, Publisher } from '../db/models';
import { AppException, ValidationException, NotFoundException } from '../exceptions';
import { keepKeys } from '../utilities/tools';

const UPDATABLE_REPORT_KEYS = [
  'name',
  'url',
  'ParentReportId',
  'datePublished',
  'description',
  'quality',
  'price',
  'keywords',
  'regions',
  'updateFrequency',
];

export async function createReport(reportData, publisher) {
  const report = await Report.create(reportData).catch(Sequelize.ValidationError, (e) => {
    if (e.errors[0].message === 'name must be unique') {
      throw new ValidationException([], 'Report with this name already exists.');
    }

    throw new ValidationException([], 'Validation error.');
  });
  if (!report) {
    throw new AppException('Could not create report.');
  }

  if (publisher) {
    await report.setPublisher(publisher);
  }

  return report;
}

// TODO: remove keywords temporary fix
export async function createOrRetrieveReport(reportData, publisher) {
  const keywords = reportData.keywords;
  const regions = reportData.regions;
  delete reportData.keywords;
  delete reportData.regions;

  const report = await Report.findOne(
    { where: reportData },
    {
      include: [{ model: ReportBranch, required: false }, { model: Publisher, required: false }],
    },
  );
  if (!report) {
    reportData.keywords = keywords;
    reportData.regions = regions;
    return createReport(reportData, publisher);
  }

  return report;
}

export async function getReportById(reportId) {
  const report = await Report.findByPk(reportId, {
    include: [{ model: ReportBranch, required: false }, { model: Publisher, required: false }],
  });
  if (!report) {
    throw new NotFoundException('Report not found.');
  }

  return report;
}

export async function getReportByName(reportName) {
  const report = await Report.findOne(
    { where: { name: reportName } },
    {
      include: [{ model: ReportBranch, required: false }, { model: Publisher, required: false }],
    },
  );
  if (!report) {
    throw new NotFoundException('Report not found.');
  }

  return report;
}

export async function updateReport(reportId, reportData) {
  const report = await Report.findByPk(reportId);
  if (!report) {
    throw new NotFoundException('Report not found.');
  }

  const cleanReportData = keepKeys(reportData, UPDATABLE_REPORT_KEYS);
  await report.update(cleanReportData).catch(() => {
    throw new AppException('Could not update report.');
  });

  return report;
}

export async function incrementNumUrlClicks(repordId) {
  const report = await Report.findByPk(repordId);
  if (!report) {
    throw new NotFoundException('Report not found.');
  }

  const numUrlClicks = report.numUrlClicks + 1;

  await report.update({ numUrlClicks }).catch(() => {
    throw new AppException('Could not increment numUrlClicks.');
  });

  return report;
}
