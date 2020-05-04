import { cloneDeep } from 'lodash';
import { AppException, ValidationException, NotFoundException } from '../exceptions';
import db from '../db/models';

/* ORDER OF SEARCHING

1. Industry [LEVELS]
2. Metric
3. Segmentation [LEVELS]
4. Time Unit
5. Time Window
6. Data Unit

*/

const COL_MAPPING = {
  INDUSTRY: 'industry',
  METRIC: 'metric',
  SEGMENTATION: 'segmentation',
  TIME_UNIT: 'timeUnit',
  TIME_FROM: 'timeFrom',
  TIME_TO: 'timeTo',
  DATA_UNIT: 'dataUnit',
};

const NA_INDUSTRY = 'N/A';
const NO_SEGMENTATION = 'No Segmentation';
const NA_DATA_UNIT = 'N/A';
const SURVEY_AND_STATISTICS_INDUSTRY = 'Survey & Statistics Data';

const MAX_INDUSTRY_DEPTH = 10;
const MAX_BRANCHES_TO_RETURN = 10;

const QUERY_ALL_COLUMNS = `COUNT(*) OVER() AS "totalCount", COUNT(*) AS "matchingReportBranchCount", r.id, r.name, r.url, r."datePublished", r.description, r.quality, r.price, r.keywords, r.regions, \
  AVG(rb.completeness) AS completeness, \
  jsonb_agg(jsonb_build_object(\
    'id', rb.id, 'industry', rb.industry, 'metric', rb.metric, 'segmentation', rb.segmentation, 'completeness', rb.completeness, \
    'timeUnit', rb."timeUnit", 'timeFrom', rb."timeFrom", 'timeTo', rb."timeTo", 'dataUnit', rb."dataUnit", \
    'unitDescription', rb."unitDescription", 'page', rb."page", 'dataSource',rb."dataSource", 'data', rb.data)) \
    AS "ReportBranches", \
  jsonb_build_object('id', p.id, 'name', p.name, 'description', p.description, 'quality', p.quality) as "Publisher", \
  CASE WHEN p.name='Statista' then 1 ELSE 0 END AS "isStatista"`;

// Checks if user's account is enabled for industry they are searching
export function isSearchAllowed(searchParams, industryEnabled) {
  if (!industryEnabled.length || !searchParams.industry.length) return false;

  for (let i = 0; i < Math.min(industryEnabled.length, searchParams.industry.length); i++) {
    if (i == searchParams.industry.length - 1 && searchParams.industry[i] === NA_INDUSTRY) {
      return true;
    }
    if (industryEnabled[i] !== searchParams.industry[i]) {
      return false;
    }
  }

  return true;
}

export function searchAllowedMiddleware(req, res, next) {
  const searchParams = req.query;
  const { industriesEnabled } = req.user;

  let searchAllowed = false;
  for (let i = 0; i < industriesEnabled.length; i++) {
    if (isSearchAllowed(searchParams, industriesEnabled[i])) {
      searchAllowed = true;
      break;
    }
  }

  if (!searchAllowed) {
    return next(new AppException('Your account is not subscribed to this subindustry.', 1));
  }

  next();
}

function buildSearchQuery(
  searchParams,
  strictIndustry = true,
  strictSegmentation = true,
  columns = '*',
) {
  const {
    industry,
    metric,
    segmentation,
    timeUnit,
    timeFrom,
    timeTo,
    dataUnit,
    freeReportsOnly,
  } = searchParams;

  let industrySubQuery = '';
  if (Array.isArray(strictIndustry)) {
    // Multiple Industries case
    industrySubQuery += '(';
    industry.map((itemOuter, indexOuter) => {
      industrySubQuery += '(';
      itemOuter.map((itemInner, indexInner) => {
        industrySubQuery += `rb.industry[${indexInner + 1}]='${itemInner.trim()}'`;
        if (indexInner != itemOuter.length - 1) industrySubQuery += ' AND ';
      });
      if (strictIndustry[indexOuter]) {
        industrySubQuery += ` AND array_length(rb.industry, 1) = ${itemOuter.length}`;
      }
      industrySubQuery += ')';
      if (indexOuter != industry.length - 1) industrySubQuery += ' OR ';
    });
    industrySubQuery += ')';
  } else {
    // Single Industry case
    industry.map((item, index) => {
      industrySubQuery += `rb.industry[${index + 1}]='${item.trim()}'`;
      if (index != industry.length - 1) industrySubQuery += ' AND ';
    });
    if (strictIndustry) {
      industrySubQuery += ` AND array_length(rb.industry, 1) = ${industry.length}`;
    }
  }

  let rawQuery = 'SELECT ';
  rawQuery += `${columns} FROM "Reports" r, "ReportBranches" rb, "Publishers" p WHERE ${industrySubQuery}`;

  if (metric && metric !== '') {
    rawQuery += ` AND rb.metric = '${metric.trim()}'`;
  }
  if (segmentation) {
    let segmentationSubQuery = '';
    if (segmentation.length != 0) {
      segmentation.map((item, index) => {
        segmentationSubQuery += `rb.segmentation[${index + 1}] = '${item.trim()}'`;
        if (index != segmentation.length - 1) segmentationSubQuery += ' AND ';
      });
    }
    if (strictSegmentation) {
      if (segmentationSubQuery !== '') segmentationSubQuery += ' AND';
      if (segmentation.length != 0) {
        segmentationSubQuery += ` array_length(rb.segmentation, 1) = ${segmentation.length}`;
      } else {
        segmentationSubQuery += ` array_length(rb.segmentation, 1) IS NULL`;
      }
    }
    rawQuery += ` AND ${segmentationSubQuery}`;
  }
  if (timeUnit && timeUnit !== '') {
    rawQuery += ` AND rb."timeUnit" = '${timeUnit.toUpperCase().trim()}'`;
  }
  if (dataUnit && dataUnit !== '') {
    if (dataUnit === NA_DATA_UNIT) rawQuery += ` AND rb."dataUnit" IS NULL`;
    else rawQuery += ` AND rb."dataUnit" = '${dataUnit.trim()}'`;
  }
  if (timeFrom) {
    rawQuery += ` AND rb."timeTo" >= ${timeFrom}`;
  }
  if (timeTo) {
    rawQuery += ` AND rb."timeFrom" <= ${timeTo}`;
  }
  if (freeReportsOnly) {
    rawQuery += ` AND r."price" = 0`;
  }
  rawQuery += ` AND rb."ReportId" = r.id AND r."PublisherId" = p.id`;

  return rawQuery;
}

// Sort by report id necessary for deterministic behavior
const DEFAULT_SEARCH_SORT =
  'ORDER BY "isStatista" ASC, r.quality DESC, p.name ASC, completeness DESC, r."datePublished" DESC, r.id DESC';
const POSSIBLE_SORT_ORDERS = ['ASC', 'DESC'];
const SORT_FIELD_TO_COLUMN_MAPPING = {
  price: 'r."price"',
  datePublished: 'r."datePublished"',
  quality: 'r.quality',
};
function getSqlForSorting(sortField, sortOrder) {
  if (!sortField || !sortOrder) {
    return DEFAULT_SEARCH_SORT;
  }
  if (
    !SORT_FIELD_TO_COLUMN_MAPPING[sortField] ||
    !POSSIBLE_SORT_ORDERS.includes(sortOrder.toUpperCase())
  ) {
    throw new Error('Invalid search query');
  }
  return `ORDER BY ${SORT_FIELD_TO_COLUMN_MAPPING[sortField]} ${sortOrder}, r."datePublished" DESC, r.id DESC`;
}

const MAX_QUICK_FILTER_LENGTH = 60;
const QUICK_FILTER_COLUMNS = [
  'r.name',
  "CASE WHEN r.description IS NOT NULL THEN r.description ELSE '' END",
  "CASE WHEN r.keywords IS NOT NULL THEN r.keywords ELSE '' END",
  'rb.industry[array_upper(rb.industry, 1)]',
  'rb.metric',
  "CASE WHEN array_upper(rb.segmentation, 1) IS NOT NULL THEN rb.segmentation[array_upper(rb.segmentation, 1)] ELSE '' END",
  'CASE WHEN rb."unitDescription" IS NOT NULL THEN rb."unitDescription" ELSE \'\' END',
  "(rb.data::json->>'message')",
  "CASE WHEN array_to_string(rb.regions, ' ') IS NOT NULL THEN array_to_string(rb.regions, ' ') ELSE '' END",
  'p.name',
];
const CONCAT_SEARCH_PHRASE = QUICK_FILTER_COLUMNS.join(' || ');

function getSqlForQuickFilter(quickFilterValue) {
  const searchVal = quickFilterValue.trim().substring(0, MAX_QUICK_FILTER_LENGTH);
  const quickFilterSql = searchVal
    .split(' ')
    .map((el) => `(${CONCAT_SEARCH_PHRASE}) ILIKE '%${el}%'`)
    .join(' AND ');

  return quickFilterSql;
}

// TODO: Query not flexible enough. Messy w/ required "rb...." Can also remove the Reports join
// colSubIndex starts at 1. ie Sector = 1, Industry = 2, SubIndustry = 3
// Segmentation = 1, SubSegmentation = 2, etc
// TODO: Need to do a security check on column & colSubIndex. Only allow certain values.
// TODO: Refactor industry dropdown section
export async function getDropdownList(searchParamsIn, industriesEnabled, column, colSubIndex = 0) {
  // To make searchParamsIn not mutated.
  // TODO: need better solution
  const searchParams = cloneDeep(searchParamsIn);

  if (column === COL_MAPPING.INDUSTRY) {
    const industry = searchParams[COL_MAPPING.INDUSTRY];
    const dropdownList = [];

    if (colSubIndex == 1) {
      industriesEnabled.map((industryEnabled) => {
        if (!dropdownList.includes(industryEnabled[0])) dropdownList.push(industryEnabled[0]);
      });

      dropdownList.sort();
      return dropdownList;
    } else {
      const matchingIndustriesEnabled = industriesEnabled.filter((industryEnabled) => {
        for (let i = 0; i < Math.min(industryEnabled.length, colSubIndex - 1); i++) {
          if (industryEnabled[i] !== industry[i]) {
            return false;
          }
        }
        return true;
      });

      if (matchingIndustriesEnabled.length == 0) {
        return [];
      }

      let mustQueryForIndustry = false;
      // Check if industry search is within higher-level industry that is enabled
      for (let i = 0; i < matchingIndustriesEnabled.length; i++) {
        if (matchingIndustriesEnabled[i].length < colSubIndex) {
          mustQueryForIndustry = true;
          break;
        }
      }

      if (!mustQueryForIndustry) {
        matchingIndustriesEnabled.map((industryEnabled) => {
          if (!dropdownList.includes(industryEnabled[colSubIndex - 1]))
            dropdownList.push(industryEnabled[colSubIndex - 1]);
        });

        dropdownList.sort();
        return dropdownList;
      }
    }
  }

  const industry = searchParams[COL_MAPPING.INDUSTRY];
  const segmentation = searchParams[COL_MAPPING.SEGMENTATION];
  const strictIndustry = industry[industry.length - 1] === NA_INDUSTRY;
  const strictSegmentation = segmentation
    ? segmentation[segmentation.length - 1] === NO_SEGMENTATION
    : false;

  // Remove N/A and No Segmentation Selections
  if (strictIndustry) {
    searchParams[COL_MAPPING.INDUSTRY].pop();
  }
  if (strictSegmentation) {
    searchParams[COL_MAPPING.SEGMENTATION].pop();
  }

  const colAndIndex = `"${column}"` + (colSubIndex ? `[${colSubIndex}]` : '');

  const rawQuery =
    buildSearchQuery(searchParams, strictIndustry, strictSegmentation, `rb.${colAndIndex}`) +
    ` GROUP BY rb.${colAndIndex} ORDER BY rb.${colAndIndex} ASC`;

  const rawResults = await db.sequelize.query(rawQuery, { type: db.sequelize.QueryTypes.SELECT });
  return rawResults.map((item) => item[column]);
}

const getLastElement = (arr) => arr[arr.length - 1];

// TODO: Improve this
function groomReportBranchResults(searchParamsIn, reports) {
  // To make searchParamsIn not mutated.
  const searchParams = cloneDeep(searchParamsIn);
  const searchIndustry = getLastElement(searchParams.industry);

  for (let i = 0; i < reports.length; i++) {
    const report = reports[i];
    const branches = report.ReportBranches;
    let existingIndustries = [];
    let existingMetrics = [];
    let existingSegments = [];

    for (let j = 0; j < branches.length; j++) {
      const branch = branches[j];
      const branchIndustry = getLastElement(branch.industry);
      const hasSegmentation = branch.segmentation ? !!branch.segmentation.length : false;
      const branchSegmentation = hasSegmentation ? branch.segmentation[0] : null;
      const isMatchingIndustry = branchIndustry === searchIndustry;
      const isUniqueIndustry = existingIndustries.indexOf(branchIndustry) < 0;
      const isUniqueMetric = existingMetrics.indexOf(branch.metric) < 0;
      const isUniqueSegmentation = hasSegmentation
        ? existingSegments.indexOf(branchSegmentation) < 0
        : false;

      if (isMatchingIndustry && isUniqueMetric && !hasSegmentation) {
        branch.rank = 10000;
      } else if (isMatchingIndustry && isUniqueSegmentation) {
        branch.rank = 9000;
      } else if (isUniqueIndustry && !hasSegmentation) {
        branch.rank = 8000;
      } else {
        if (!hasSegmentation) {
          branch.rank = 100;
        } else {
          branch.rank = 100 - branch.segmentation.length;
        }
      }
    }

    branches.sort((a, b) => {
      if (a.rank !== b.rank) {
        return b.rank - a.rank;
      }
      const industryA = getLastElement(a.industry);
      const industryB = getLastElement(b.industry);
      if (industryA !== industryA) {
        return industryA > industryB ? 1 : -1;
      }
      return a.metric > b.metric ? 1 : -1;
    });

    // We keep all branches for Survey & Statistics Data
    if (
      !(
        searchParamsIn.industry.length >= 3 &&
        searchParamsIn.industry[2] === SURVEY_AND_STATISTICS_INDUSTRY
      )
    ) {
      report.manyMoreReportBranches = branches.length > 10;
      report.ReportBranches = branches.slice(0, MAX_BRANCHES_TO_RETURN);
    }
  }

  return reports;
}

// TODO: Make ORDER BY variable. Add check to search param columns
export async function searchByParams(searchParamsIn, industriesEnabled) {
  // To make searchParamsIn not mutated.
  // TODO: need better solution
  const searchParams = cloneDeep(searchParamsIn);

  const {
    industry,
    segmentation,
    sortField,
    sortOrder,
    quickFilter,
    offset = 0,
    limit = 20,
  } = searchParams;

  const offsetValue = Number(offset);
  const limitValue = Number(limit);

  // TODO: Move these checks to controller
  if (!Number.isInteger(offsetValue) || !Number.isInteger(limitValue) || limitValue > 40) {
    throw new Error('Invalid search query');
  }

  let strictIndustry = industry[industry.length - 1] === NA_INDUSTRY;
  const strictSegmentation = segmentation
    ? segmentation[segmentation.length - 1] === NO_SEGMENTATION
    : false;

  // Remove N/A and No Segmentation Selections
  if (strictIndustry) {
    searchParams[COL_MAPPING.INDUSTRY].pop();
  }
  if (strictSegmentation) {
    searchParams[COL_MAPPING.SEGMENTATION].pop();
  }

  // Handle open-ended industry searches
  let specificIndustries;
  let strictIndustries;
  if (!strictIndustry) {
    strictIndustries = [true];
    specificIndustries = [industry];

    const matchingIndustriesEnabled = industriesEnabled.filter((industryEnabled) => {
      for (let i = 0; i < Math.min(industryEnabled.length, industry.length); i++) {
        if (industryEnabled[i] !== industry[i]) {
          return false;
        }
      }
      return true;
    });

    matchingIndustriesEnabled.map((industryEnabled) => {
      if (industryEnabled.length < industry.length) {
        specificIndustries.push(industry);
      } else {
        specificIndustries.push(industryEnabled);
      }
      strictIndustries.push(false);
    });

    strictIndustry = strictIndustries;
    searchParams.industry = specificIndustries;
  }

  const rawQuery =
    buildSearchQuery(searchParams, strictIndustry, strictSegmentation, QUERY_ALL_COLUMNS) +
    (quickFilter ? ` AND (${getSqlForQuickFilter(quickFilter)})` : '') +
    ' GROUP BY r.id, p.id ' +
    getSqlForSorting(sortField, sortOrder) +
    ` LIMIT ${limitValue} OFFSET ${offsetValue}`;

  const items = await db.sequelize.query(rawQuery, { type: db.sequelize.QueryTypes.SELECT });

  return {
    totalCount: items.length ? Number(items[0].totalCount) : 0,
    items: groomReportBranchResults(searchParamsIn, items),
  };
}

// Length of matching IndustryEnabled should be less than or equal to the search industry
export async function getDistinctIndustries(industriesEnabled) {
  if (industriesEnabled.length == 0) {
    throw new AppException('Your account is not subscribed to any industries.', 1);
  }

  let rawQuery = 'SELECT industry FROM "ReportBranches" WHERE ';

  for (let i = 0; i < industriesEnabled.length; i++) {
    const industry = industriesEnabled[i];

    rawQuery += '(';
    industry.map((item, index) => {
      rawQuery += `industry[${index + 1}]='${item.trim()}'`;
      if (index != industry.length - 1) rawQuery += ' AND ';
    });
    rawQuery += ') ';
    rawQuery += i != industriesEnabled.length - 1 ? 'OR ' : '';
  }

  rawQuery += 'GROUP BY industry ORDER BY ';
  for (let j = 1; j <= MAX_INDUSTRY_DEPTH; j++) {
    // Use replace function to ignore parentheses when sorting
    rawQuery += `replace(industry[${j}], '(', '') ASC${j != MAX_INDUSTRY_DEPTH ? ',' : ''}`;
  }

  const rawResults = await db.sequelize.query(rawQuery, { type: db.sequelize.QueryTypes.SELECT });

  return rawResults.map((item) => item[COL_MAPPING.INDUSTRY]);
}

// Get top publishers for industry explorer view
export async function getIndustryPublishers(searchParamsIn, industriesEnabled) {
  // To make searchParamsIn not mutated.
  // TODO: need better solution
  const searchParams = cloneDeep(searchParamsIn);

  const industry = searchParams[COL_MAPPING.INDUSTRY];
  let strictIndustry = industry[industry.length - 1] === NA_INDUSTRY;

  // Remove N/A and No Segmentation Selections
  if (strictIndustry) {
    searchParams[COL_MAPPING.INDUSTRY].pop();
  }

  // Handle open-ended industry searches
  let specificIndustries;
  let strictIndustries;
  if (!strictIndustry) {
    strictIndustries = [true];
    specificIndustries = [industry];

    const matchingIndustriesEnabled = industriesEnabled.filter((industryEnabled) => {
      for (let i = 0; i < Math.min(industryEnabled.length, industry.length); i++) {
        if (industryEnabled[i] !== industry[i]) {
          return false;
        }
      }
      return true;
    });

    matchingIndustriesEnabled.map((industryEnabled) => {
      if (industryEnabled.length < industry.length) {
        specificIndustries.push(industry);
      } else {
        specificIndustries.push(industryEnabled);
      }
      strictIndustries.push(false);
    });

    strictIndustry = strictIndustries;
    searchParams.industry = specificIndustries;
  }

  const rawQuery =
    buildSearchQuery(searchParams, strictIndustry, false, 'p.name, COUNT(p.name) AS pcount') +
    ' GROUP BY p.name ORDER BY pcount DESC';

  const rawResults = await db.sequelize.query(rawQuery, { type: db.sequelize.QueryTypes.SELECT });

  return rawResults.map((item) => item['name']);
}

// Get top metrics for industry explorer view
export async function getIndustryMetrics(searchParamsIn, industriesEnabled) {
  // To make searchParamsIn not mutated.
  // TODO: need better solution
  const searchParams = cloneDeep(searchParamsIn);

  const industry = searchParams[COL_MAPPING.INDUSTRY];
  let strictIndustry = industry[industry.length - 1] === NA_INDUSTRY;

  // Remove N/A and No Segmentation Selections
  if (strictIndustry) {
    searchParams[COL_MAPPING.INDUSTRY].pop();
  }

  // Handle open-ended industry searches
  let specificIndustries;
  let strictIndustries;
  if (!strictIndustry) {
    strictIndustries = [true];
    specificIndustries = [industry];

    const matchingIndustriesEnabled = industriesEnabled.filter((industryEnabled) => {
      for (let i = 0; i < Math.min(industryEnabled.length, industry.length); i++) {
        if (industryEnabled[i] !== industry[i]) {
          return false;
        }
      }
      return true;
    });

    matchingIndustriesEnabled.map((industryEnabled) => {
      if (industryEnabled.length < industry.length) {
        specificIndustries.push(industry);
      } else {
        specificIndustries.push(industryEnabled);
      }
      strictIndustries.push(false);
    });

    strictIndustry = strictIndustries;
    searchParams.industry = specificIndustries;
  }

  const rawQuery =
    buildSearchQuery(searchParams, strictIndustry, false, 'rb.metric, COUNT(rb.metric) AS mcount') +
    ' GROUP BY rb.metric ORDER BY mcount DESC';

  const rawResults = await db.sequelize.query(rawQuery, { type: db.sequelize.QueryTypes.SELECT });

  return rawResults.map((item) => item['metric']);
}

// Get top segmentations for industry explorer view
// TODO: Make Matching Industries Enabled Code reuseable
export async function getIndustrySegmentations(searchParamsIn, industriesEnabled) {
  // To make searchParamsIn not mutated.
  // TODO: need better solution
  const searchParams = cloneDeep(searchParamsIn);

  const industry = searchParams[COL_MAPPING.INDUSTRY];
  let strictIndustry = industry[industry.length - 1] === NA_INDUSTRY;

  // Remove N/A and No Segmentation Selections
  if (strictIndustry) {
    searchParams[COL_MAPPING.INDUSTRY].pop();
  }

  // Handle open-ended industry searches
  let specificIndustries;
  let strictIndustries;
  if (!strictIndustry) {
    strictIndustries = [true];
    specificIndustries = [industry];

    const matchingIndustriesEnabled = industriesEnabled.filter((industryEnabled) => {
      for (let i = 0; i < Math.min(industryEnabled.length, industry.length); i++) {
        if (industryEnabled[i] !== industry[i]) {
          return false;
        }
      }
      return true;
    });

    matchingIndustriesEnabled.map((industryEnabled) => {
      if (industryEnabled.length < industry.length) {
        specificIndustries.push(industry);
      } else {
        specificIndustries.push(industryEnabled);
      }
      strictIndustries.push(false);
    });

    strictIndustry = strictIndustries;
    searchParams.industry = specificIndustries;
  }

  // Query for only 1st level of segmentation
  // const rawQuery =
  //   'SELECT segmentation[1] AS segs, COUNT(segmentation[1]) AS scount FROM (' +
  //   buildSearchQuery(searchParams, strictIndustry, false, QUERY_ALL_COLUMNS, false) +
  //   ' ORDER BY r.id DESC) t GROUP BY segs ORDER BY scount DESC;';

  const rawQuery =
    buildSearchQuery(
      searchParams,
      strictIndustry,
      false,
      'segmentation[1] AS segs, COUNT(segmentation[1]) AS scount',
    ) + ' GROUP BY segs ORDER BY scount DESC';

  const rawResults = await db.sequelize.query(rawQuery, { type: db.sequelize.QueryTypes.SELECT });

  return rawResults.map((item) => item['segs']);
}
