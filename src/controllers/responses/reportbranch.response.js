export default function reportBranchResponse(reportBranch) {
  return {
    id: reportBranch.id,
    ReportId: reportBranch.ReportId,
    industry: reportBranch.industry,
    metric: reportBranch.metric,
    segmentation: reportBranch.segmentation,
    timeUnit: reportBranch.timeUnit,
    timeFrom: reportBranch.timeFrom,
    timeTo: reportBranch.timeTo,
    dataUnit: reportBranch.dataUnit,
    unitDescription: reportBranch.unitDescription,
    regions: reportBranch.regions,
    page: reportBranch.page,
    dataSource: reportBranch.dataSource,
    catalogerNotes: reportBranch.catalogerNotes,
    data: reportBranch.data,
  };
}
