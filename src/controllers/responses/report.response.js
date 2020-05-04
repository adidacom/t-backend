import reportBranchResponse from './reportbranch.response';

export default function reportResponse(report) {
  const ReportBranches = report.ReportBranches.map((reportBranch) => {
    return reportBranchResponse(reportBranch);
  });

  return {
    id: report.id,
    name: report.name,
    url: report.id,
    ParentReportId: report.ParentReportId,
    datePublished: report.datePublished,
    keywords: report.keywords,
    regions: report.regions,
    quality: report.quality,
    price: report.price,
    Publisher,
    ReportBranches,
  };
}
