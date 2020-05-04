import { IndustryService, SearchService } from '../services';
import { SUBSCRIPTION_STATUSES } from '../db/helpers/dbEnums';

const TRIAL_EXPLORER_LIST_LENGTH = 3;

export async function getDistinctIndustries(req, res, next) {
  try {
    const { industriesEnabled } = req.user;

    const industries = await SearchService.getDistinctIndustries(industriesEnabled);

    res.status(200);
    res.send(industries);
  } catch (errors) {
    next(errors);
  }
}

// Open API Call for taxonomy preview
export async function getDistinctIndustriesPreview(req, res, next) {
  try {
    const industriesEnabled = [['Technology', 'Cybersecurity']];

    const industries = await SearchService.getDistinctIndustries(industriesEnabled);

    res.status(200);
    res.send(industries);
  } catch (errors) {
    next(errors);
  }
}

export async function getIndustryPublishers(req, res, next) {
  try {
    const { searchParams } = req.query;
    const { industriesEnabled, subscription } = req.user;

    let publishers = await SearchService.getIndustryPublishers(searchParams, industriesEnabled);

    // Check subscription status and decrement searchesRemaining
    if (subscription.status === SUBSCRIPTION_STATUSES.TRIAL) {
      if (publishers.length > TRIAL_EXPLORER_LIST_LENGTH) {
        publishers = publishers.slice(0, TRIAL_EXPLORER_LIST_LENGTH);
      }
    }

    res.status(200);
    res.send(publishers);
  } catch (errors) {
    next(errors);
  }
}

export async function getIndustryMetrics(req, res, next) {
  try {
    const { searchParams } = req.query;
    const { industriesEnabled, subscription } = req.user;

    let metrics = await SearchService.getIndustryMetrics(searchParams, industriesEnabled);

    // Check subscription status and decrement searchesRemaining
    if (subscription.status === SUBSCRIPTION_STATUSES.TRIAL) {
      if (metrics.length > TRIAL_EXPLORER_LIST_LENGTH) {
        metrics = metrics.slice(0, TRIAL_EXPLORER_LIST_LENGTH);
      }
    }

    res.status(200);
    res.send(metrics);
  } catch (errors) {
    next(errors);
  }
}

export async function getIndustrySegmentations(req, res, next) {
  try {
    const { searchParams } = req.query;
    const { industriesEnabled, subscription } = req.user;

    let segmentations = await SearchService.getIndustrySegmentations(
      searchParams,
      industriesEnabled,
    );

    // Check subscription status and decrement searchesRemaining
    if (subscription.status === SUBSCRIPTION_STATUSES.TRIAL) {
      if (segmentations.length > TRIAL_EXPLORER_LIST_LENGTH) {
        segmentations = segmentations.slice(0, TRIAL_EXPLORER_LIST_LENGTH);
      }
    }

    res.status(200);
    res.send(segmentations);
  } catch (errors) {
    next(errors);
  }
}

// TODO: Maybe subscription check middleware!
export async function getIndustryOverview(req, res, next) {
  try {
    const { searchParams } = req.query;
    const { industriesEnabled, subscription } = req.user;

    let publishers = await SearchService.getIndustryPublishers(
      { ...searchParams },
      industriesEnabled,
    );
    let metrics = await SearchService.getIndustryMetrics({ ...searchParams }, industriesEnabled);
    let segmentations = await SearchService.getIndustrySegmentations(
      { ...searchParams },
      industriesEnabled,
    );

    // Check subscription status and decrement searchesRemaining
    if (subscription.status === SUBSCRIPTION_STATUSES.TRIAL) {
      if (publishers.length > TRIAL_EXPLORER_LIST_LENGTH) {
        // Remove Statista if needed
        if (publishers.includes('Statista')) {
          publishers.splice(publishers.indexOf('Statista'), 1);
        }

        publishers = publishers.slice(0, TRIAL_EXPLORER_LIST_LENGTH);
      }
      if (metrics.length > TRIAL_EXPLORER_LIST_LENGTH) {
        metrics = metrics.slice(0, TRIAL_EXPLORER_LIST_LENGTH);
      }
      if (segmentations.length > TRIAL_EXPLORER_LIST_LENGTH) {
        segmentations = segmentations.slice(0, TRIAL_EXPLORER_LIST_LENGTH);
      }
    }

    const industry = await IndustryService.getIndustryByPath(searchParams.industry);

    res.status(200);
    res.send({
      id: industry.id,
      publishers,
      metrics,
      segmentations,
      description: industry.description,
      statistics: industry.statistics,
    });
  } catch (errors) {
    next(errors);
  }
}
