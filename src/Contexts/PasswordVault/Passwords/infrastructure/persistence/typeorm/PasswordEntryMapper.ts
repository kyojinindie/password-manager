import { PasswordEntry } from '../../../domain/PasswordEntry';
import { PasswordEntryId } from '../../../domain/PasswordEntryId';
import { SiteName } from '../../../domain/SiteName';
import { SiteUrl } from '../../../domain/SiteUrl';
import { Username } from '../../../domain/Username';
import { EncryptedPassword } from '../../../domain/EncryptedPassword';
import { Category } from '../../../domain/Category';
import { Notes } from '../../../domain/Notes';
import { Tags } from '../../../domain/Tags';
import { Tag } from '../../../domain/Tag';
import { CreatedAt } from '../../../domain/CreatedAt';
import { UpdatedAt } from '../../../domain/UpdatedAt';
import { PasswordEntryEntity } from './PasswordEntryEntity';

/**
 * PasswordEntryMapper
 *
 * Translates between Domain model and Persistence model.
 * This is a critical component of Hexagonal Architecture.
 *
 * Responsibilities:
 * - Convert PasswordEntry aggregate → PasswordEntryEntity (for saving)
 * - Convert PasswordEntryEntity → PasswordEntry aggregate (for loading)
 * - Handle null/undefined values correctly
 * - Reconstruct Value Objects from primitives
 *
 * Why we need a mapper:
 * - Domain model uses rich Value Objects (SiteName, Username, etc.)
 * - Database model uses primitives (string, number, etc.)
 * - Domain model is immutable and behavior-rich
 * - Database model is mutable and anemic (just data)
 * - Allows independent evolution of domain and persistence
 *
 * Architecture principles:
 * - This mapper is PRIVATE to infrastructure layer
 * - Never exposed outside the repository
 * - Centralizes all mapping logic in one place
 * - Makes testing easier (mock the repository, not the mapper)
 *
 * Error Handling:
 * - If mapping fails, it indicates data corruption or schema mismatch
 * - These are exceptional cases that should be logged and investigated
 * - In production, consider adding validation and error recovery
 */
export class PasswordEntryMapper {
  /**
   * Converts a domain PasswordEntry aggregate to a TypeORM entity
   *
   * This method:
   * 1. Extracts primitives from Value Objects using .value getters
   * 2. Handles optional fields (siteUrl, notes, tags)
   * 3. Creates a new entity instance with all data
   *
   * Used when:
   * - Saving a new password entry to database
   * - Updating an existing password entry
   *
   * @param domain - The PasswordEntry domain aggregate
   * @returns TypeORM entity ready for persistence
   *
   * Note: TypeORM will handle INSERT vs UPDATE based on whether
   * the entity already exists in the database.
   */
  public static toEntity(domain: PasswordEntry): PasswordEntryEntity {
    const entity = new PasswordEntryEntity();

    // Extract primitives from domain aggregate
    entity.id = domain.id.value;
    entity.userId = domain.userId; // Already a primitive string
    entity.siteName = domain.siteName.value;
    entity.siteUrl = domain.siteUrl.value; // Can be null
    entity.username = domain.username.value;
    entity.encryptedPassword = domain.encryptedPassword.value;
    entity.category = domain.category.value;
    entity.notes = domain.notes.value; // Can be null
    entity.tags = domain.tags.toStringArray(); // Convert Tags VO to string[]
    entity.createdAt = domain.createdAt.value;
    entity.updatedAt = domain.updatedAt.value;

    return entity;
  }

  /**
   * Converts a TypeORM entity to a domain PasswordEntry aggregate
   *
   * This method:
   * 1. Creates Value Objects from primitives
   * 2. Reconstructs the domain aggregate using constructor
   * 3. Handles optional fields correctly (empty VOs for null values)
   *
   * Used when:
   * - Loading password entries from database
   * - After a save/update operation (to return domain object)
   *
   * @param entity - The TypeORM entity loaded from database
   * @returns Fully reconstructed PasswordEntry domain aggregate
   *
   * Important:
   * - We use the PasswordEntry constructor directly (not .create factory)
   * - The .create factory is for NEW entries with generated IDs
   * - Here we're RECONSTRUCTING an existing entry with its original ID
   *
   * Error Handling:
   * - If any VO constructor throws (validation error), it indicates
   *   data corruption in the database
   * - This should never happen if data was written through our repository
   * - In production, consider wrapping in try-catch and logging
   */
  public static toDomain(entity: PasswordEntryEntity): PasswordEntry {
    // Reconstruct Value Objects from primitives
    const id = new PasswordEntryId(entity.id);
    const siteName = new SiteName(entity.siteName);
    const siteUrl = entity.siteUrl ? new SiteUrl(entity.siteUrl) : SiteUrl.empty();
    const username = new Username(entity.username);
    const encryptedPassword = new EncryptedPassword(entity.encryptedPassword);
    const category = Category.fromString(entity.category);
    const notes = entity.notes ? new Notes(entity.notes) : Notes.empty();
    const tags = this.reconstructTags(entity.tags);
    const createdAt = new CreatedAt(entity.createdAt);
    const updatedAt = new UpdatedAt(entity.updatedAt);

    // Reconstruct the aggregate using constructor
    // Note: We DON'T use PasswordEntry.create() because that generates a new ID
    return new PasswordEntry(
      id,
      entity.userId,
      siteName,
      siteUrl,
      username,
      encryptedPassword,
      category,
      notes,
      tags,
      createdAt,
      updatedAt
    );
  }

  /**
   * Reconstructs Tags value object from database array
   *
   * The database stores tags as string[] (simple JSON array).
   * We need to convert each string to a Tag VO, then wrap in Tags collection.
   *
   * @param tagStrings - Array of tag strings from database
   * @returns Tags VO containing Tag VOs
   *
   * Edge cases:
   * - Empty array → Tags.empty()
   * - Null/undefined → Tags.empty() (defensive programming)
   * - Duplicates → Handled by Tags VO (it enforces uniqueness)
   *
   * Note: Tags VO validates each tag and enforces uniqueness,
   * so we don't need to do it here.
   */
  private static reconstructTags(tagStrings: string[]): Tags {
    // Defensive programming: handle null/undefined
    if (!tagStrings || tagStrings.length === 0) {
      return Tags.empty();
    }

    // Convert each string to Tag VO
    const tagVOs = tagStrings.map(tagString => new Tag(tagString));

    // Wrap in Tags collection
    return new Tags(tagVOs);
  }
}

/**
 * Usage Example in Repository:
 *
 * ```typescript
 * // Saving to database
 * async save(passwordEntry: PasswordEntry): Promise<void> {
 *   const entity = PasswordEntryMapper.toEntity(passwordEntry);
 *   await this.repository.save(entity);
 * }
 *
 * // Loading from database
 * async findById(id: PasswordEntryId): Promise<PasswordEntry | null> {
 *   const entity = await this.repository.findOne({ where: { id: id.value } });
 *   if (!entity) return null;
 *   return PasswordEntryMapper.toDomain(entity);
 * }
 * ```
 */

/**
 * Testing Considerations:
 *
 * Unit tests for this mapper should verify:
 * 1. Round-trip conversion (domain → entity → domain) preserves all data
 * 2. Optional fields are handled correctly (null → empty VOs → null)
 * 3. Tags array is converted correctly in both directions
 * 4. Date objects are preserved correctly
 * 5. Value Objects are correctly reconstructed with validation
 *
 * Example test:
 * ```typescript
 * it('should preserve data in round-trip conversion', () => {
 *   const original = PasswordEntryMother.random();
 *   const entity = PasswordEntryMapper.toEntity(original);
 *   const reconstructed = PasswordEntryMapper.toDomain(entity);
 *   expect(reconstructed.equals(original)).toBe(true);
 * });
 * ```
 */
