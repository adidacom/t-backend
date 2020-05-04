import { Company, Industry, Publisher, Report, ReportBranch } from '../db/models';

export async function deleteReportData() {
  await ReportBranch.destroy({ where: {} });
  await Report.destroy({ where: {} });
  return Publisher.destroy({ where: {} });
}

export function deleteCompanyData() {
  return Company.destroy({ where: {} });
}

export function deleteIndustryData() {
  return Industry.destroy({ where: {} });
}
