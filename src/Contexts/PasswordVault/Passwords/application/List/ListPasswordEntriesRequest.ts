/**
 * ListPasswordEntriesRequest DTO
 *
 * Data Transfer Object for requesting a list of password entries.
 * This DTO is part of the Application Layer and contains only primitives.
 *
 * Properties:
 * - userId: The user requesting their password entries
 * - page: Current page number (1-based, default: 1)
 * - limit: Number of items per page (default: 20)
 * - sortBy: Field to sort by (default: 'siteName')
 * - sortOrder: Sort direction (default: 'asc')
 * - category: Optional category filter
 *
 * NOTE: This is a simple DTO with NO business logic.
 */
export interface ListPasswordEntriesRequest {
  readonly userId: string;
  readonly page?: number;
  readonly limit?: number;
  readonly sortBy?: 'siteName' | 'createdAt' | 'category';
  readonly sortOrder?: 'asc' | 'desc';
  readonly category?: string;
}
