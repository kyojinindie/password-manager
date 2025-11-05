import { PasswordEntry } from './PasswordEntry';
import { PasswordEntryId } from './PasswordEntryId';

/**
 * PasswordEntryRepository Port
 *
 * Repository interface for persisting and retrieving PasswordEntry aggregates.
 * This is a PORT in Hexagonal Architecture - the implementation will be in Infrastructure layer.
 *
 * Follows the Repository pattern from DDD:
 * - Works with aggregate roots, not individual entities
 * - Methods use domain language
 * - Returns domain objects, not primitives
 * - Does NOT contain business logic
 */
export interface PasswordEntryRepository {
  /**
   * Persists a PasswordEntry aggregate.
   * Creates new entry if it doesn't exist, updates if it does.
   *
   * @param passwordEntry - The password entry to save
   */
  save(passwordEntry: PasswordEntry): Promise<void>;

  /**
   * Finds a password entry by its unique identifier.
   *
   * @param id - The password entry ID
   * @returns The password entry if found, null otherwise
   */
  findById(id: PasswordEntryId): Promise<PasswordEntry | null>;

  /**
   * Finds all password entries belonging to a specific user.
   *
   * @param userId - The user ID (primitive string)
   * @returns Array of password entries (empty array if none found)
   */
  findByUserId(userId: string): Promise<PasswordEntry[]>;

  /**
   * Finds password entries belonging to a user with criteria-based filtering,
   * sorting, and pagination.
   *
   * Business rules enforced:
   * - Only returns entries belonging to the specified user
   * - Supports sorting by siteName, createdAt, category
   * - Supports pagination via limit and offset
   * - Supports filtering by category
   *
   * @param userId - The user ID (primitive string)
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @param sortBy - Field to sort by (siteName, createdAt, category)
   * @param sortOrder - Sort order (asc or desc)
   * @param category - Optional category filter
   * @returns Array of password entries matching the criteria
   */
  findByUserIdWithCriteria(
    userId: string,
    page: number,
    limit: number,
    sortBy: string,
    sortOrder: 'asc' | 'desc',
    category?: string
  ): Promise<PasswordEntry[]>;

  /**
   * Counts total password entries belonging to a user.
   * Used for pagination metadata calculations.
   *
   * @param userId - The user ID (primitive string)
   * @param category - Optional category filter
   * @returns Total count of entries for this user
   */
  countByUserId(userId: string, category?: string): Promise<number>;

  /**
   * Deletes a password entry by its ID.
   * This method should verify ownership before deletion (business rule enforcement).
   *
   * @param id - The password entry ID
   * @param userId - The user ID attempting deletion (for authorization check)
   * @returns true if deleted, false if not found
   */
  delete(id: PasswordEntryId, userId: string): Promise<boolean>;
}
