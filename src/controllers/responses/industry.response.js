export default function industryResponse(industry) {
  return {
    id: industry.id,
    path: industry.path,
    name: industry.name,
    abbreviation: industry.abbreviation,
    statistics: industry.statistics,
  };
}
