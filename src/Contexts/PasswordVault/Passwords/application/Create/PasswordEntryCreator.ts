import { PasswordEntryRepository } from '../../domain/PasswordEntryRepository';
import { PasswordEncryptionService } from '../../domain/PasswordEncryptionService';
import { PasswordEntry } from '../../domain/PasswordEntry';
import { SiteName } from '../../domain/SiteName';
import { SiteUrl } from '../../domain/SiteUrl';
import { Username } from '../../domain/Username';
import { Category } from '../../domain/Category';
import { Notes } from '../../domain/Notes';
import { Tags } from '../../domain/Tags';
import { Tag } from '../../domain/Tag';
import { CreatePasswordEntryRequest } from './CreatePasswordEntryRequest';
import { CreatePasswordEntryResponse } from './CreatePasswordEntryResponse';

/**
 * PasswordEntryCreator Application Service
 *
 * Orchestrates the creation of a new password entry.
 * This is a USE CASE in the application layer.
 *
 * Responsibilities (ONLY ORCHESTRATION):
 * 1. Receive DTO with primitives
 * 2. Convert primitives to Value Objects (domain validation happens here)
 * 3. Encrypt the plain password using PasswordEncryptionService port
 * 4. Delegate to PasswordEntry.create() factory method
 * 5. Persist using PasswordEntryRepository port
 * 6. Return DTO response
 *
 * Does NOT contain business logic - that's in the domain layer.
 * Does NOT access infrastructure directly - uses ports (interfaces).
 */
export class PasswordEntryCreator {
  public constructor(
    private readonly passwordEntryRepository: PasswordEntryRepository,
    private readonly passwordEncryptionService: PasswordEncryptionService
  ) {}

  /**
   * Executes the use case to create a new password entry.
   *
   * Flow:
   * 1. Create Value Objects from primitives (throws if validation fails)
   * 2. Encrypt the plain password
   * 3. Create the PasswordEntry aggregate using factory method
   * 4. Persist the aggregate
   * 5. Map aggregate to Response DTO
   *
   * @param request - DTO with primitives from the controller
   * @returns Response DTO with created entry data (WITHOUT password)
   * @throws InvalidSiteNameException if site name is invalid
   * @throws InvalidSiteUrlException if site URL is invalid
   * @throws InvalidUsernameException if username is invalid
   * @throws InvalidCategoryException if category is invalid
   * @throws InvalidNotesException if notes exceed max length
   * @throws InvalidTagException if any tag is invalid
   */
  public async run(
    request: CreatePasswordEntryRequest
  ): Promise<CreatePasswordEntryResponse> {
    // Step 1: Create Value Objects from primitives
    // Domain validation happens in VO constructors
    const siteName = new SiteName(request.siteName);
    const siteUrl = request.siteUrl ? new SiteUrl(request.siteUrl) : undefined;
    const username = new Username(request.username);
    const category = Category.fromString(request.category);
    const notes = request.notes ? new Notes(request.notes) : undefined;
    const tags = request.tags ? this.createTags(request.tags) : undefined;

    // Step 2: Encrypt the plain password using the port
    // The service will return an EncryptedPassword VO
    const encryptedPassword = await this.passwordEncryptionService.encrypt(
      request.password,
      request.userId
    );

    // Step 3: Create the PasswordEntry aggregate using factory method
    // All business rules are enforced in the domain layer
    const passwordEntry = PasswordEntry.create(
      request.userId,
      siteName,
      username,
      encryptedPassword,
      category,
      siteUrl,
      notes,
      tags
    );

    // Step 4: Persist the aggregate using the repository port
    await this.passwordEntryRepository.save(passwordEntry);

    // Step 5: Map domain aggregate to Response DTO
    return this.toResponse(passwordEntry);
  }

  /**
   * Creates a Tags VO from an array of string primitives.
   *
   * @param tagStrings - Array of tag strings
   * @returns Tags VO containing Tag VOs
   */
  private createTags(tagStrings: string[]): Tags {
    const tagVOs = tagStrings.map(tagString => new Tag(tagString));
    return new Tags(tagVOs);
  }

  /**
   * Maps a PasswordEntry aggregate to a Response DTO.
   * Note: Password is NOT included in the response for security.
   *
   * @param passwordEntry - The created password entry aggregate
   * @returns Response DTO with primitives
   */
  private toResponse(passwordEntry: PasswordEntry): CreatePasswordEntryResponse {
    return {
      id: passwordEntry.id.value,
      siteName: passwordEntry.siteName.value,
      siteUrl: passwordEntry.siteUrl.value, // null if empty
      username: passwordEntry.username.value,
      category: passwordEntry.category.value,
      notes: passwordEntry.notes.value, // null if empty
      tags: passwordEntry.tags.toStringArray(),
      createdAt: passwordEntry.createdAt.value,
      updatedAt: passwordEntry.updatedAt.value,
    };
  }
}
