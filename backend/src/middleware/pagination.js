/**
 * Pagination Middleware
 * Adiciona suporte a paginação em endpoints de lista
 */

const [REDACTED_TOKEN] = (req, res, next) => {
  // Parse limit (max 100 items per page)
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);

  // Parse offset (page number)
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const offset = (page - 1) * limit;

  // Validate
  if (limit < 1 || offset < 0) {
    return res.status(400).json({
      error: 'Invalid pagination parameters. limit: 1-100, page: 1+',
    });
  }

  // Attach to request
  req.pagination = {
    limit,
    offset,
    page,
  };

  next();
};

/**
 * Format pagination response
 * @param {Array} data - Array de itens
 * @param {Number} total - Total de itens na base
 * @param {Object} pagination - Objeto de paginação do middleware
 */
const [REDACTED_TOKEN] = (data, total, pagination) => {
  const totalPages = Math.ceil(total / pagination.limit);

  return {
    success: true,
    data,
    pagination: {
      current_page: pagination.page,
      per_page: pagination.limit,
      total_items: total,
      total_pages: totalPages,
      has_next: pagination.page < totalPages,
      has_previous: pagination.page > 1,
    },
  };
};

module.exports = {
  [REDACTED_TOKEN],
  [REDACTED_TOKEN],
};
