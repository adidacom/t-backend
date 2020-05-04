export default function searchResponse(searchResults) {
  return {
    totalCount: searchResults.totalCount,
    items: searchResults.items.map((result) => {
      return {
        id: result.id,
        name: result.name,
        url: result.url,
        description: result.description,
        datePublished: result.datePublished,
        keywords: result.keywords,
        regions: result.regions,
        quality: result.quality,
        completeness: result.completeness,
        price: result.price,
        Publisher: {
          id: result.Publisher.id,
          name: result.Publisher.name,
          description: result.Publisher.description,
          quality: result.Publisher.quality,
        },
        manyMoreReportBranches: result.manyMoreReportBranches || false,
        ReportBranches: result.ReportBranches.map((reportBranch) => {
          return {
            id: reportBranch.id,
            industry: reportBranch.industry,
            metric: reportBranch.metric,
            segmentation: reportBranch.segmentation,
            completeness: reportBranch.completeness,
            timeUnit: reportBranch.timeUnit,
            timeFrom: reportBranch.timeFrom,
            timeTo: reportBranch.timeTo,
            dataUnit: reportBranch.dataUnit,
            unitDescription: reportBranch.unitDescription,
            page: reportBranch.page,
            data: reportBranch.data,
          };
        }),
      };
    }),
  };
}
