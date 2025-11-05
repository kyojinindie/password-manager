import { PasswordEntryRepository } from '../../domain/PasswordEntryRepository';
import { PasswordEntry } from '../../domain/PasswordEntry';
import { PasswordEntryId } from '../../domain/PasswordEntryId';

/**
 * In-Memory Password Entry Repository - Secondary Adapter
 *
 * In-memory implementation of PasswordEntryRepository for development and testing.
 * This is a SECONDARY (driven/output) adapter in Hexagonal Architecture.
 *
 * Architecture Notes:
 * - Implements the PasswordEntryRepository port from domain layer
 * - Stores password entries in memory (Map data structure)
 * - No persistence - data is lost when process restarts
 * - Suitable for development, testing, and demos
 * - NOT suitable for production use
 *
 * Responsibilities:
 * - Persist PasswordEntry aggregates in memory
 * - Retrieve password entries by ID or userId
 * - Delete password entries with ownership verification
 * - Maintain data consistency within the process
 *
 * What this adapter DOES NOT do:
 * - Business logic (that's in domain layer)
 * - Validation (that's in domain layer)
 * - Encryption (that's in PasswordEncryptionService)
 * - Authorization beyond basic ownership checks
 *
 * Storage Strategy:
 * - Uses Map<string, PasswordEntry> for O(1) lookups by ID
 * - Keeps domain objects directly (no serialization needed)
 * - Thread-safe within single process (JavaScript is single-threaded)
 *
 * Advantages:
 * - Fast operations (no I/O)
 * - No external dependencies (no database setup)
 * - Perfect for testing (easy to reset state)
 * - Simple to understand and maintain
 *
 * Disadvantages:
 * - Data lost on restart
 * - Not scalable (limited to process memory)
 * - Not suitable for distributed systems
 * - No concurrent access from multiple processes
 *
 * Migration Path:
 * When ready for production, replace with:
 * - TypeOrmPasswordEntryRepository (already exists)
 * - MongoPasswordEntryRepository
 * - PostgresPasswordEntryRepository
 * - Or any other implementation
 *
 * The beauty of Hexagonal Architecture:
 * - No code changes needed in domain or application layers
 * - Just swap this implementation at dependency injection time
 * - All business logic remains unchanged
 */
export class InMemoryPasswordEntryRepository implements PasswordEntryRepository {
  /**
   * In-memory storage: Map<entryId, PasswordEntry>
   *
   * Key: Password entry ID (string)
   * Value: PasswordEntry aggregate root
   *
   * Why Map instead of Array:
   * - O(1) lookup by ID (Array would be O(n))
   * - Easy to check existence
   * - Natural key-value relationship
   * - Efficient updates and deletes
   */
  private readonly entries: Map<string, PasswordEntry> = new Map();

  /**
   * Persists a PasswordEntry aggregate
   *
   * Creates new entry if it doesn't exist (INSERT)
   * Updates existing entry if it does exist (UPDATE)
   *
   * This is an "upsert" operation - common in DDD repositories
   *
   * @param passwordEntry - The password entry aggregate to save
   * @returns Promise<void>
   *
   * Implementation Notes:
   * - We store the aggregate directly (no serialization needed)
   * - In TypeORM implementation, we'd convert to entity first
   * - The aggregate is already validated (domain ensures invariants)
   * - No additional validation needed here
   *
   * Concurrency Notes (for future TypeORM implementation):
   * - Consider optimistic locking (version field)
   * - Handle concurrent updates gracefully
   * - Use database transactions for consistency
   */
  public async save(passwordEntry: PasswordEntry): Promise<void> {
    // Store the aggregate using its ID as the key
    // Map.set() overwrites if key exists (upsert behavior)
    this.entries.set(passwordEntry.id.value, passwordEntry);

    // Return resolved Promise to satisfy async interface
    // This maintains consistency with real implementations that do I/O
    return Promise.resolve();
  }

  /**
   * Finds a password entry by its unique identifier
   *
   * @param id - The password entry ID (Value Object)
   * @returns Promise<PasswordEntry | null>
   *
   * Returns:
   * - PasswordEntry aggregate if found
   * - null if not found (NOT undefined - explicit null pattern)
   *
   * Why return null instead of throwing?
   * - Not finding an entry is NOT an error - it's a valid business case
   * - Caller decides how to handle (throw exception, return 404, etc.)
   * - Follows the Repository pattern from DDD
   *
   * Implementation Notes:
   * - Map.get() returns undefined if key doesn't exist
   * - We convert undefined to null for explicitness
   * - No need to copy the aggregate (we trust our own code)
   */
  public async findById(id: PasswordEntryId): Promise<PasswordEntry | null> {
    // Lookup by ID value (the primitive string)
    const entry = this.entries.get(id.value);

    // Return entry if found, null otherwise
    // Use ?? operator to convert undefined to null
    return Promise.resolve(entry ?? null);
  }

  /**
   * Finds all password entries belonging to a specific user
   *
   * @param userId - The user ID (primitive string)
   * @returns Promise<PasswordEntry[]>
   *
   * Returns:
   * - Array of PasswordEntry aggregates (empty array if none found)
   * - Never returns null (empty array is the "nothing found" signal)
   *
   * Implementation Notes:
   * - Iterates through all entries and filters by userId
   * - O(n) operation - not efficient for large datasets
   * - In TypeORM implementation, use WHERE clause for efficiency
   * - Returns array copy to prevent external mutation
   *
   * Performance Considerations (for real implementations):
   * - Add index on userId column
   * - Use pagination for large result sets
   * - Consider caching for frequently accessed data
   * - Use query optimization (EXPLAIN ANALYZE in postgres)
   *
   * Security Note:
   * - userId comes from authenticated user (JWT token)
   * - This naturally enforces authorization (users see only their entries)
   * - No additional authorization checks needed here
   */
  public async findByUserId(userId: string): Promise<PasswordEntry[]> {
    // Filter entries by userId
    // Note: We're iterating all entries here (inefficient but acceptable for in-memory)
    const userEntries: PasswordEntry[] = [];

    for (const entry of this.entries.values()) {
      // Compare userId (primitive string)
      // PasswordEntry.userId is already a primitive (not a VO)
      if (entry.userId === userId) {
        userEntries.push(entry);
      }
    }

    // Return array (empty if no entries found)
    return Promise.resolve(userEntries);
  }

  /**
   * Finds password entries belonging to a user with criteria-based filtering,
   * sorting, and pagination.
   *
   * @param userId - The user ID (primitive string)
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @param sortBy - Field to sort by (siteName, createdAt, category)
   * @param sortOrder - Sort order (asc or desc)
   * @param category - Optional category filter
   * @returns Promise<PasswordEntry[]>
   *
   * Returns:
   * - Array of PasswordEntry aggregates matching criteria
   * - Empty array if no entries found
   * - Results are filtered, sorted, and paginated
   *
   * Implementation Notes:
   * - Filters by userId (authorization)
   * - Optionally filters by category
   * - Sorts in-memory using JavaScript sort
   * - Applies pagination using slice
   * - O(n log n) for sorting, acceptable for in-memory
   *
   * Performance Considerations:
   * - In-memory implementation is simple but not scalable
   * - TypeORM implementation should use database sorting/pagination
   * - Database is much more efficient for these operations
   */
  public async findByUserIdWithCriteria(
    userId: string,
    page: number,
    limit: number,
    sortBy: string,
    sortOrder: 'asc' | 'desc',
    category?: string
  ): Promise<PasswordEntry[]> {
    // Step 1: Filter entries by userId
    let userEntries: PasswordEntry[] = [];

    for (const entry of this.entries.values()) {
      if (entry.userId === userId) {
        userEntries.push(entry);
      }
    }

    // Step 2: Filter by category if provided
    if (category) {
      userEntries = userEntries.filter(entry => {
        const primitives = entry.toPrimitives();
        return primitives.category === category;
      });
    }

    // Step 3: Sort entries
    userEntries.sort((a, b) => {
      const primitivesA = a.toPrimitives();
      const primitivesB = b.toPrimitives();

      let compareValue = 0;

      if (sortBy === 'siteName') {
        compareValue = primitivesA.siteName.localeCompare(primitivesB.siteName);
      } else if (sortBy === 'createdAt') {
        compareValue = primitivesA.createdAt.getTime() - primitivesB.createdAt.getTime();
      } else if (sortBy === 'category') {
        compareValue = primitivesA.category.localeCompare(primitivesB.category);
      }

      // Apply sort order
      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    // Step 4: Apply pagination
    const offset = (page - 1) * limit;
    const paginatedEntries = userEntries.slice(offset, offset + limit);

    return Promise.resolve(paginatedEntries);
  }

  /**
   * Counts total password entries belonging to a user
   *
   * @param userId - The user ID (primitive string)
   * @param category - Optional category filter
   * @returns Promise<number>
   *
   * Returns:
   * - Total count of entries for this user
   * - Respects category filter if provided
   *
   * Implementation Notes:
   * - Iterates through all entries
   * - Counts matches based on userId (and category if provided)
   * - O(n) operation
   */
  public async countByUserId(userId: string, category?: string): Promise<number> {
    let count = 0;

    for (const entry of this.entries.values()) {
      if (entry.userId === userId) {
        // If category filter is provided, check it matches
        if (category) {
          const primitives = entry.toPrimitives();
          if (primitives.category === category) {
            count++;
          }
        } else {
          count++;
        }
      }
    }

    return Promise.resolve(count);
  }

  /**
   * Deletes a password entry by its ID with ownership verification
   *
   * @param id - The password entry ID (Value Object)
   * @param userId - The user ID attempting deletion (for authorization)
   * @returns Promise<boolean>
   *
   * Returns:
   * - true if entry was found and deleted
   * - false if entry not found OR user doesn't own the entry
   *
   * Security - Ownership Verification:
   * This method enforces that users can only delete their own entries.
   * - If entry doesn't exist → return false (don't reveal existence)
   * - If entry exists but belongs to different user → return false
   * - If entry exists and belongs to user → delete and return true
   *
   * Why return false instead of throwing?
   * - Prevents information leakage (can't distinguish "not found" from "unauthorized")
   * - Idempotent behavior (deleting non-existent entry is safe)
   * - Caller can decide whether false is an error or acceptable
   *
   * Implementation Notes:
   * - First retrieves entry to check ownership
   * - Then deletes if authorized
   * - Two-step process ensures authorization is always checked
   *
   * Database Implementation Notes:
   * ```sql
   * DELETE FROM password_entries
   * WHERE id = ? AND user_id = ?
   * RETURNING id;
   * ```
   * - Use RETURNING to check if row was deleted
   * - Single query handles both authorization and deletion
   * - Database enforces atomic operation
   */
  public async delete(id: PasswordEntryId, userId: string): Promise<boolean> {
    // Step 1: Find the entry
    const entry = this.entries.get(id.value);

    // Step 2: Check if entry exists
    if (!entry) {
      // Entry doesn't exist - return false (idempotent)
      return Promise.resolve(false);
    }

    // Step 3: Verify ownership (CRITICAL SECURITY CHECK)
    if (entry.userId !== userId) {
      // Entry exists but belongs to different user
      // Return false without revealing the entry exists
      // This prevents unauthorized deletion and information leakage
      return Promise.resolve(false);
    }

    // Step 4: Delete the entry (authorized)
    const wasDeleted = this.entries.delete(id.value);

    // Return deletion result
    // wasDeleted will be true (we know entry exists from Step 2)
    return Promise.resolve(wasDeleted);
  }

  /**
   * ==========================================
   * TESTING HELPERS (Not part of port interface)
   * ==========================================
   *
   * These methods are NOT defined in PasswordEntryRepository interface.
   * They're provided to facilitate testing and development.
   *
   * IMPORTANT: Do NOT use these in production code.
   * Only use in test setup and teardown.
   */

  /**
   * Clears all password entries from the repository
   *
   * Testing use cases:
   * - Reset state between tests
   * - Clean up after test suite
   * - Ensure test isolation
   *
   * @returns Promise<void>
   */
  public async clear(): Promise<void> {
    this.entries.clear();
    return Promise.resolve();
  }

  /**
   * Gets the total count of password entries
   *
   * Testing use cases:
   * - Verify entries were saved
   * - Assert repository state
   * - Check bulk operations
   *
   * @returns number - Total count of entries
   */
  public count(): number {
    return this.entries.size;
  }

  /**
   * Gets the count of password entries for a specific user (synchronous testing helper)
   *
   * NOTE: This is a TESTING HELPER, not part of the repository interface.
   * The repository interface has an async version: countByUserId(userId, category?)
   *
   * Testing use cases:
   * - Verify user's entries were saved
   * - Assert findByUserId results
   * - Check authorization logic
   *
   * @param userId - The user ID to count entries for
   * @returns number - Count of entries for this user
   */
  public countByUserIdSync(userId: string): number {
    let count = 0;
    for (const entry of this.entries.values()) {
      if (entry.userId === userId) {
        count++;
      }
    }
    return count;
  }

  /**
   * Gets all password entries (for testing purposes)
   *
   * Testing use cases:
   * - Inspect repository state
   * - Debug test failures
   * - Verify bulk operations
   *
   * WARNING: Never use this in production code!
   * It violates authorization boundaries.
   *
   * @returns PasswordEntry[] - All entries in repository
   */
  public getAllEntries(): PasswordEntry[] {
    return Array.from(this.entries.values());
  }
}

/**
 * Usage Example in Tests:
 *
 * ```typescript
 * import { InMemoryPasswordEntryRepository } from './InMemoryPasswordEntryRepository';
 * import { PasswordEntryCreator } from '../../application/Create/PasswordEntryCreator';
 * import { MockPasswordEncryptionService } from '../../../../../tests/mocks/MockPasswordEncryptionService';
 *
 * describe('PasswordEntryCreator Integration Test', () => {
 *   let repository: InMemoryPasswordEntryRepository;
 *   let creator: PasswordEntryCreator;
 *
 *   beforeEach(() => {
 *     // Create fresh repository for each test (test isolation)
 *     repository = new InMemoryPasswordEntryRepository();
 *     const encryptionService = new MockPasswordEncryptionService();
 *     creator = new PasswordEntryCreator(repository, encryptionService);
 *   });
 *
 *   afterEach(async () => {
 *     // Clean up after test
 *     await repository.clear();
 *   });
 *
 *   it('should create and retrieve password entry', async () => {
 *     // Create entry
 *     const response = await creator.run({
 *       userId: 'user-123',
 *       siteName: 'GitHub',
 *       username: 'johndoe',
 *       password: 'MyPassword123!',
 *       category: 'WORK',
 *     });
 *
 *     // Verify it was saved
 *     const entries = await repository.findByUserId('user-123');
 *     expect(entries).toHaveLength(1);
 *     expect(entries[0].siteName.value).toBe('GitHub');
 *   });
 *
 *   it('should enforce ownership on delete', async () => {
 *     // Create entry for user-123
 *     const response = await creator.run({
 *       userId: 'user-123',
 *       siteName: 'GitHub',
 *       username: 'johndoe',
 *       password: 'MyPassword123!',
 *       category: 'WORK',
 *     });
 *
 *     const entryId = new PasswordEntryId(response.id);
 *
 *     // Try to delete as different user
 *     const deleted = await repository.delete(entryId, 'user-456');
 *
 *     // Deletion should fail (ownership check)
 *     expect(deleted).toBe(false);
 *
 *     // Entry should still exist
 *     const entry = await repository.findById(entryId);
 *     expect(entry).not.toBeNull();
 *   });
 * });
 * ```
 */

/**
 * Dependency Injection Example:
 *
 * ```typescript
 * // In dependencies.ts or server.ts
 * import { InMemoryPasswordEntryRepository } from './persistence/InMemoryPasswordEntryRepository';
 * import { PasswordEntryCreator } from '../application/Create/PasswordEntryCreator';
 * import { PasswordEncryptionServiceImpl } from '../../../Authentication/Users/infrastructure/PasswordEncryptionServiceImpl';
 *
 * // Create repository (in-memory for development)
 * const passwordEntryRepository = new InMemoryPasswordEntryRepository();
 *
 * // Create encryption service
 * const passwordEncryptionService = new PasswordEncryptionServiceImpl();
 *
 * // Create use case with dependencies
 * const passwordEntryCreator = new PasswordEntryCreator(
 *   passwordEntryRepository,
 *   passwordEncryptionService
 * );
 *
 * // Create controller
 * const createPasswordEntryController = new CreatePasswordEntryController(
 *   passwordEntryCreator
 * );
 * ```
 */

/**
 * Migration to TypeORM:
 *
 * When ready for production, simply replace this line:
 * ```typescript
 * const repository = new InMemoryPasswordEntryRepository();
 * ```
 *
 * With this:
 * ```typescript
 * const repository = new TypeOrmPasswordEntryRepository(dataSource.getRepository(PasswordEntryEntity));
 * ```
 *
 * That's it! No other code changes needed.
 * This is the power of Hexagonal Architecture + Dependency Inversion.
 */
