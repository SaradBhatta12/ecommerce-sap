/**
 * Pagination utility functions
 * These are client-side utilities that don't require server actions
 */

export type PaginationParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export type PaginationInfo = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

/**
 * Validates and normalizes pagination parameters
 * @param {PaginationParams} params - The pagination parameters to validate
 * @returns {Object} Normalized pagination parameters
 */
export function validatePagination(params: PaginationParams) {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 20));
  const skip = (page - 1) * limit;
  
  return { page, limit, skip, search: params.search || '' };
}