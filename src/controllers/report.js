import { ReportService } from '../services';
import reportResponse from './responses/report.response';

export async function createReport(req, res, next) {
  try {
    const { report, reportBranch } = req.body;
    const reportInstance = await ReportService.createReport(report, reportBranch);
    res.status(200);
    res.send(reportResponse(reportInstance));
  } catch (errors) {
    next(errors);
  }
}

// TODO: Fix this call. Not ccurrently used
export async function createReportBranches(req, res, next) {
  try {
    const { reportId } = req.params;
    const { reportBranches } = req.body;
    const reportInstance = await ReportService.createReportBranches(reportId, reportBranches);
    res.status(200);
    res.send(reportResponse(reportInstance));
  } catch (errors) {
    next(errors);
  }
}

export async function getReport(req, res, next) {
  try {
    const { reportId } = req.params;
    const reportInstance = await ReportService.getReport(reportId);
    res.status(200);
    res.send(reportResponse(reportInstance));
  } catch (errors) {
    next(errors);
  }
}

export async function updateReport(req, res, next) {
  try {
    const { reportId } = req.params;
    const { report } = req.body;
    const reportInstance = await ReportService.updateReport(reportId, report);
    res.status(200);
    res.send(reportResponse(reportInstance));
  } catch (errors) {
    next(errors);
  }
}

export async function updateReportBranch(req, res, next) {
  try {
    const { reportBranchId } = req.params;
    const { reportBranch } = req.body;
    const reportInstance = await ReportService.updateReport(reportBranchId, reportBranch);
    res.status(200);
    res.send(reportResponse(reportInstance));
  } catch (errors) {
    next(errors);
  }
}
