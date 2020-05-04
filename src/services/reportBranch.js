import Sequelize from 'sequelize';
import { ReportBranch } from '../db/models';
import { AppException, ValidationException, NotFoundException } from '../exceptions';
import { keepKeys } from '../utilities/tools';

const UPDATABLE_REPORT_BRANCH_KEYS = [
  'industry',
  'metric',
  'segmentation',
  'timeUnit',
  'timeFrom',
  'timeTo',
  'dataUnit',
  'unitDescription',
  'regions',
  'dataSource',
  'catalogerNotes',
  'data',
];

export async function createReportBranch(reportBranchData, report) {
  if (!report) {
    throw new AppException('Cannot create report branch with report argument.');
  }

  const reportBranch = await ReportBranch.create({
    ...reportBranchData,
    ReportId: report.id,
  }).catch(Sequelize.ValidationError, (e) => {
    if (e.errors[0].message === 'rbCompositeIndex must be unique') {
      throw new ValidationException([], 'Report branch already exists.');
    }

    throw new ValidationException([], 'Validation error.');
  });
  if (!reportBranch) {
    throw new AppException('Could not create report branch.');
  }

  return reportBranch;
}

export async function createReportBranches(reportBranchesData, report) {
  const reportBranches = [];

  try {
    for (let i = 0; i < reportBranchesData.length; i++) {
      const reportBranch = await createReportBranch(reportBranchesData[i], report);
      reportBranches.push(reportBranch);
    }
  } catch (e) {
    throw new AppException('Could not create report branches.');
  }

  return reportBranches;
}

export async function createOrRetrieveReportBranch(reportBranchData, report) {
  if (!report) {
    throw new AppException('Cannot create/get report branch without report argument.');
  }

  const reportBranch = await ReportBranch.findOne({
    where: {
      ...reportBranchData,
      ReportId: report.id,
    },
  });

  if (!reportBranch) {
    return createReportBranch(reportBranchData, report);
  }

  return reportBranch;
}

export async function createOrRetrieveReportBranches(reportBranchesData, report) {
  const reportBranches = [];

  try {
    for (let i = 0; i < reportBranchesData.length; i++) {
      const reportBranch = await createOrRetrieveReportBranch(reportBranchesData[i], report);
      reportBranches.push(reportBranch);
    }
  } catch (e) {
    throw new AppException('Could not create/get report branches.');
  }

  return reportBranches;
}

export async function getReportBranchById(reportBranchId) {
  const reportBranch = await ReportBranch.findByPk(reportBranchId);
  if (!reportBranch) {
    throw new NotFoundException('Report branch not found.');
  }

  return reportBranch;
}

export async function getReportBranchByData(reportBranchData, report) {
  if (!report) {
    throw new AppException('Cannot get report branch without report argument.');
  }

  const reportBranch = await ReportBranch.findOne({
    where: {
      ...reportBranchData,
      ReportId: report.id,
    },
  });

  if (!reportBranch) {
    throw new NotFoundException('Report Branch not found.');
  }

  return reportBranch;
}

export async function updateReportBranch(reportBranchId, reportBranchData) {
  const reportBranch = await ReportBranch.findByPk(reportBranchId);
  if (!reportBranch) {
    throw new NotFoundException('Report branch not found.');
  }

  const cleanedReportBranchData = keepKeys(reportBranchData, UPDATABLE_REPORT_BRANCH_KEYS);
  await reportBranch.update(cleanedReportBranchData).catch(() => {
    throw new AppException('Could not update report branch.');
  });

  return reportBranch;
}
