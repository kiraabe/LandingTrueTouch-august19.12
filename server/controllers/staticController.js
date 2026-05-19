import * as staticQueries from '../queries/static.js';
import { getPaginationParams, buildPaginatedResponse, buildSuccessResponse } from '../utils/helpers.js';

export const getCountries = async (req, res, next) => {
  try {
    const countries = await staticQueries.getCountries();
    res.json(buildSuccessResponse(countries));
  } catch (error) {
    next(error);
  }
};

export const getLocations = async (req, res, next) => {
  try {
    const filters = {
      countryId: req.query.countryId ? parseInt(req.query.countryId) : null,
    };
    const locations = await staticQueries.getLocations(filters);
    res.json(buildSuccessResponse(locations));
  } catch (error) {
    next(error);
  }
};

export const getLocationsByCountry = async (req, res, next) => {
  try {
    const { countryId } = req.params;
    const locations = await staticQueries.getLocationsByCountry(countryId);
    res.json(buildSuccessResponse(locations));
  } catch (error) {
    next(error);
  }
};

export const getStatistics = async (req, res, next) => {
  try {
    const stats = await staticQueries.getStatistics();
    res.json(buildSuccessResponse(stats));
  } catch (error) {
    next(error);
  }
};

export const getTestimonials = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const testimonials = await staticQueries.getTestimonials(limit);
    res.json(buildSuccessResponse(testimonials));
  } catch (error) {
    next(error);
  }
};

export const getCompanies = async (req, res, next) => {
  try {
    const { limit, offset, page } = getPaginationParams(req);
    const [companies, total] = await Promise.all([
      staticQueries.getCompanies(offset, limit),
      staticQueries.getCompanyCount(),
    ]);
    res.json(buildPaginatedResponse(companies, page, limit, total));
  } catch (error) {
    next(error);
  }
};

export const getCompanyById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const company = await staticQueries.getCompanyById(id);

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json(buildSuccessResponse(company));
  } catch (error) {
    next(error);
  }
};
