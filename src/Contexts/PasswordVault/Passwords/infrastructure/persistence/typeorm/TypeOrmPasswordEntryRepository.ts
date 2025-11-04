import { Repository } from 'typeorm';
import { PasswordEntryRepository } from '../../../domain/PasswordEntryRepository';
import { PasswordEntry } from '../../../domain/PasswordEntry';
import { PasswordEntryId } from '../../../domain/PasswordEntryId';
import { PasswordEntryEntity } from './PasswordEntryEntity';
import { PasswordEntryMapper } from './PasswordEntryMapper';

/**
 * TypeOrmPasswordEntryRepository - Secondary Adapter
 *
 * This is a SECONDARY (driven/output) adapter in Hexagonal Architecture.
 * It implements the PasswordEntryRepository PORT defined in the domain layer.
 *
 * Architecture Notes:
 * - Implements the repository interface from domain
 * - Uses TypeORM for database access
 * - Hides all TypeORM details from the rest of the application
 * - Returns domain objects (PasswordEntry), never entities
 * - Translates domain operations to SQL operations
 *
 * Responsibilities:
 * - Persist PasswordEntry aggregates to database
 * - Retrieve PasswordEntry aggregates from database
 * - Translate between domain model and persistence model
 * - Handle database errors appropriately
 * - Enforce authorization rules (user can only access their own entries)
 *
 * What this repository DOES NOT do:
 * - Business logic (that's in domain/application layers)
 * - Validation (that's in Value Objects and Entities)
 * - Password encryption (that's in PasswordEncryptionService)
 * - Authorization decisions (only enforces them via queries)
 *
 * Dependency Injection:
 * - Receives TypeORM Repository<PasswordEntryEntity> as constructor dependency
 * - This allows easy testing with mocks or in-memory repositories
 * - TypeORM repository is created from DataSource at application startup
 */
export class TypeOrmPasswordEntryRepository implements PasswordEntryRepository {
  /**
   * Constructor receives TypeORM repository for PasswordEntryEntity
   *
   * The TypeORM repository provides:
   * - save(): Insert or update
   * - findOne(): Find single record
   * - find(): Find multiple records
   * - delete(): Remove records
   * - And many other useful methods
   *
   * @param repository - TypeORM repository for PasswordEntryEntity
   */
  public constructor(private readonly repository: Repository<PasswordEntryEntity>) {}

  /**
   * Persists a PasswordEntry aggregate to the database
   *
   * Implementation:
   * 1. Convert domain aggregate to TypeORM entity using mapper
   * 2. Use TypeORM's save() which handles INSERT or UPDATE automatically
   * 3. TypeORM determines INSERT vs UPDATE based on primary key existence
   *
   * Transaction handling:
   * - If you need transactions across multiple repositories, handle at
   *   application service level using TypeORM's transaction manager
   *
   * Error handling:
   * - TypeORM will throw on constraint violations (unique, foreign key, etc.)
   * - Database connection errors will also throw
   * - Let errors bubble up to be handled by application/controller layers
   *
   * @param passwordEntry - The domain aggregate to persist
   * @throws Database errors (connection, constraints, etc.)
   *
   * Note: We don't return anything because DDD repositories work with
   * aggregates in memory. The aggregate already has its ID, so no need
   * to return it.
   */
  public async save(passwordEntry: PasswordEntry): Promise<void> {
    // Step 1: Convert domain aggregate to persistence entity
    const entity = PasswordEntryMapper.toEntity(passwordEntry);

    // Step 2: Persist to database
    // TypeORM's save() handles both INSERT and UPDATE
    // - If entity.id exists in DB → UPDATE
    // - If entity.id doesn't exist in DB → INSERT
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await this.repository.save(entity);

    // Note: We don't need to map back to domain because:
    // 1. The domain aggregate we received already has all data
    // 2. Only createdAt/updatedAt might change, but those are set by domain
    // 3. Repositories in DDD work with in-memory aggregates
  }

  /**
   * Finds a password entry by its unique identifier
   *
   * Implementation:
   * 1. Query database using TypeORM's findOne()
   * 2. Return null if not found (following repository pattern)
   * 3. Map entity to domain aggregate if found
   *
   * Authorization:
   * - This method does NOT check ownership (userId)
   * - Authorization should be checked by the caller (application service)
   * - The aggregate itself has ensureBelongsToUser() for this
   *
   * @param id - The password entry ID (Value Object)
   * @returns The password entry aggregate, or null if not found
   * @throws Database errors (connection, etc.)
   *
   * Performance:
   * - Single SELECT query by primary key (very fast)
   * - Index on id column (primary key) ensures optimal performance
   */
  public async findById(id: PasswordEntryId): Promise<PasswordEntry | null> {
    // Step 1: Query database by ID
    // findOne returns null if not found (not undefined)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const entity = await this.repository.findOne({
      where: { id: id.value },
    });

    // Step 2: Return null if not found
    if (!entity) {
      return null;
    }

    // Step 3: Map entity to domain aggregate
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return PasswordEntryMapper.toDomain(entity);
  }

  /**
   * Finds all password entries belonging to a specific user
   *
   * Implementation:
   * 1. Query database filtering by userId
   * 2. Order by creation date (most recent first) for better UX
   * 3. Map all entities to domain aggregates
   * 4. Return empty array if no entries found
   *
   * Authorization:
   * - This method ENFORCES authorization via WHERE clause
   * - Only returns entries owned by the specified user
   * - No way to access other users' entries through this method
   *
   * @param userId - The user ID (primitive string, not UserId VO)
   * @returns Array of password entry aggregates (empty if none found)
   * @throws Database errors (connection, etc.)
   *
   * Performance considerations:
   * - Index on user_id column is CRITICAL for performance
   * - Without index, this becomes a full table scan (very slow)
   * - Consider pagination for users with many entries (100+)
   * - Consider adding filters (category, tags) for better UX
   *
   * Future enhancements:
   * - Add pagination: findByUserId(userId, page, limit)
   * - Add sorting options: findByUserId(userId, sortBy, order)
   * - Add filtering: findByUserId(userId, filters)
   */
  public async findByUserId(userId: string): Promise<PasswordEntry[]> {
    // Step 1: Query database filtering by userId
    // Order by createdAt DESC to show newest entries first
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const entities = await this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    // Step 2: Map all entities to domain aggregates
    // If no entries found, this returns empty array (not null)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
    return entities.map((entity: PasswordEntryEntity) => PasswordEntryMapper.toDomain(entity));
  }

  /**
   * Deletes a password entry by its ID
   *
   * Implementation:
   * 1. Check ownership (IMPORTANT for authorization)
   * 2. Delete from database if authorized
   * 3. Return true if deleted, false if not found
   *
   * Authorization:
   * - This method ENFORCES authorization before deletion
   * - Combines both id AND userId in WHERE clause
   * - Prevents users from deleting other users' entries
   * - Even if they know the entry ID, they can't delete it
   *
   * @param id - The password entry ID to delete
   * @param userId - The user ID attempting deletion (for authorization)
   * @returns true if entry was deleted, false if not found or unauthorized
   * @throws Database errors (connection, etc.)
   *
   * Business rule enforcement:
   * - User can ONLY delete their own entries
   * - Attempting to delete another user's entry returns false (not error)
   * - This is a security feature, not a bug
   *
   * Alternative implementation:
   * - Could throw UnauthorizedPasswordEntryAccessException instead
   * - Current approach treats "not found" and "unauthorized" the same
   * - This prevents information leakage (attacker can't tell if ID exists)
   *
   * Soft delete consideration:
   * - Current: Hard delete (removes from database permanently)
   * - Future: Could add soft delete with deletedAt timestamp
   * - This allows recovery and audit trail
   */
  public async delete(id: PasswordEntryId, userId: string): Promise<boolean> {
    // Step 1: Delete from database with authorization check
    // WHERE clause includes BOTH id AND userId
    // This ensures users can only delete their own entries
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const result = await this.repository.delete({
      id: id.value,
      userId: userId,
    });

    // Step 2: Check if anything was deleted
    // result.affected is the number of rows deleted
    // - undefined or 0 means nothing was deleted (not found or unauthorized)
    // - 1 means successfully deleted
    // - >1 should never happen (id is unique)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return (result.affected ?? 0) > 0;
  }
}

/**
 * Usage Example in Application Setup:
 *
 * ```typescript
 * import { DataSource } from 'typeorm';
 * import { TypeOrmPasswordEntryRepository } from './infrastructure/persistence/typeorm/TypeOrmPasswordEntryRepository';
 * import { PasswordEntryEntity } from './infrastructure/persistence/typeorm/PasswordEntryEntity';
 *
 * // Create TypeORM DataSource
 * const dataSource = new DataSource({
 *   type: 'postgres',
 *   host: 'localhost',
 *   port: 5432,
 *   username: 'user',
 *   password: 'pass',
 *   database: 'password_manager',
 *   entities: [PasswordEntryEntity],
 *   synchronize: false, // Use migrations in production!
 * });
 *
 * await dataSource.initialize();
 *
 * // Get TypeORM repository
 * const typeormRepo = dataSource.getRepository(PasswordEntryEntity);
 *
 * // Create our domain repository
 * const passwordEntryRepository = new TypeOrmPasswordEntryRepository(typeormRepo);
 *
 * // Now inject into application services
 * const passwordEntryCreator = new PasswordEntryCreator(
 *   passwordEntryRepository,
 *   passwordEncryptionService
 * );
 * ```
 */

/**
 * Testing Considerations:
 *
 * Unit tests:
 * - Mock the TypeORM Repository<PasswordEntryEntity>
 * - Test that correct TypeORM methods are called
 * - Test mapper is used correctly
 *
 * Integration tests:
 * - Use real database (test database or SQLite in-memory)
 * - Test CRUD operations end-to-end
 * - Test authorization enforcement
 * - Test edge cases (not found, duplicate IDs, etc.)
 *
 * Example integration test:
 * ```typescript
 * it('should only return entries belonging to the user', async () => {
 *   const user1Id = 'user-1';
 *   const user2Id = 'user-2';
 *
 *   await repository.save(PasswordEntryMother.withUserId(user1Id));
 *   await repository.save(PasswordEntryMother.withUserId(user2Id));
 *
 *   const user1Entries = await repository.findByUserId(user1Id);
 *   expect(user1Entries).toHaveLength(1);
 *   expect(user1Entries[0].userId).toBe(user1Id);
 * });
 * ```
 */

/**
 * Performance Optimization Tips:
 *
 * 1. Indexes (CRITICAL):
 *    - Primary key (id): Automatic
 *    - user_id: CREATE INDEX idx_password_entries_user_id
 *    - created_at: CREATE INDEX idx_password_entries_created_at
 *
 * 2. Query Optimization:
 *    - Use SELECT only needed columns (TypeORM does this by default)
 *    - Add pagination for large result sets
 *    - Consider caching for frequently accessed entries
 *
 * 3. Connection Pooling:
 *    - Configure TypeORM connection pool size
 *    - Monitor connection usage
 *    - Close connections properly
 *
 * 4. Monitoring:
 *    - Log slow queries (> 100ms)
 *    - Monitor query counts per request
 *    - Use database query analyzer (EXPLAIN ANALYZE)
 */
