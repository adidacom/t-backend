import { HubspotService, SearchService, ReportService, UserService } from '../services';
import searchResponse from './responses/search.response';
import { SUBSCRIPTION_STATUSES } from '../db/helpers/dbEnums';
import { AppException } from '../exceptions';

// Function can process one dropdown or multiple if column and colSubIndex are arrays
export async function getDropdownList(req, res, next) {
  try {
    const { column, colSubIndex, ...searchParams } = req.query;
    const { industriesEnabled, subscription } = req.user;

    // Check subscription status
    if (subscription.status === SUBSCRIPTION_STATUSES.TRIAL) {
      if (subscription.searchesRemaining < 1) {
        throw new AppException('No searches remaining.');
      }
    }

    if (!Array.isArray(column)) {
      const dropdownList = await SearchService.getDropdownList(
        searchParams,
        industriesEnabled,
        column,
        Number(colSubIndex),
      );

      res.status(200);
      res.send(dropdownList);
      return;
    }

    if (column.length !== colSubIndex.length)
      throw new AppException('column and colSubIndex arrays must be the same length.');

    const dropdownLists = [];
    const searchParamsAreArray = Array.isArray(searchParams);
    for (let i = 0; i < column.length; i++) {
      const curSearchParams = searchParamsAreArray ? searchParams[i] : searchParams;
      const curColumn = column[i];
      const curColSubIndex = colSubIndex[i];

      const dropdownList = await SearchService.getDropdownList(
        curSearchParams,
        industriesEnabled,
        curColumn,
        Number(curColSubIndex),
      );

      dropdownLists.push(dropdownList);
    }

    res.status(200);
    res.send(dropdownLists);
  } catch (errors) {
    next(errors);
  }
}

export async function searchByParams(req, res, next) {
  try {
    const searchParams = req.query;
    const { industriesEnabled, subscription } = req.user;

    if (searchParams.freeReportsOnly) {
      searchParams.freeReportsOnly = searchParams.freeReportsOnly.toLowerCase() === 'true';
    }

    const searchResults = await SearchService.searchByParams(searchParams, industriesEnabled);

    // Check subscription status and decrement searchesRemaining
    if (subscription.status === SUBSCRIPTION_STATUSES.TRIAL) {
      if (subscription.searchesRemaining < 1) {
        throw new AppException('No searches remaining.', 1, 403);
      }

      if (searchResults.items.length > 3) {
        searchResults.items = searchResults.items.slice(0, 3);
      }

      await UserService.updateSubscription(req.user.id, {
        searchesRemaining: subscription.searchesRemaining - 1,
      });
    }

    if (!searchParams.offset) {
      const user = await UserService.incrementSearchCount(req.user.id);
      // Only update if user has perform less than 7 searches to reduce API calls
      if (user.searchCount < 7) {
        await HubspotService.updateHubspotContactT4AppUsage(user);
      }
    }

    res.status(200);
    res.send(searchResponse(searchResults));
  } catch (errors) {
    next(errors);
  }
}

export async function reportUrlClicked(req, res, next) {
  try {
    const { ReportId, name, url, ReportBranchId, searchParams } = req.body;

    await ReportService.incrementNumUrlClicks(ReportId);

    res.status(200);
    res.send({ success: true });
  } catch (errors) {
    next(errors);
  }
}
