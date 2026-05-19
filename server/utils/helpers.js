import environment from '../config/environment.js';

export const getPaginationParams = (req) => {
  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || environment.pagination.DEFAULT_LIMIT;

  page = Math.max(1, page);
  limit = Math.min(Math.max(1, limit), environment.pagination.MAX_LIMIT);

  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

export const buildPaginatedResponse = (data, page, limit, total) => {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

export const buildSuccessResponse = (data, message = null) => {
  const response = { data };
  if (message) response.message = message;
  return response;
};

export const buildErrorResponse = (message, status = 400) => {
  return {
    error: message,
    status,
  };
};

export const sanitizeQuery = (query) => {
  if (typeof query !== 'string') return '';
  return query.trim().substring(0, 100);
};
