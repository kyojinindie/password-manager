import { AggregateRoot } from '../../../Shared/domain/AggregateRoot';
import { PasswordEntryId } from './PasswordEntryId';
import { SiteName } from './SiteName';
import { SiteUrl } from './SiteUrl';
import { Username } from './Username';
import { EncryptedPassword } from './EncryptedPassword';
import { Category } from './Category';
import { Notes } from './Notes';
import { Tags } from './Tags';
import { CreatedAt } from './CreatedAt';
import { UpdatedAt } from './UpdatedAt';
import { UnauthorizedPasswordEntryAccessException } from './UnauthorizedPasswordEntryAccessException';

/**
 * PasswordEntry Aggregate Root
 *
 * Represents a password entry in the password vault.
 * This is the main aggregate that manages all password-related business logic.
 *
 * Business Rules:
 * - Only the owner (userId) can access and modify the entry
 * - Password is always stored encrypted
 * - Site name and username are mandatory
 * - URL must be valid if provided
 * - Category must be one of the predefined values
 * - Tags are unique (no duplicates)
 * - Notes have a maximum length of 1000 characters
 */
export class PasswordEntry extends AggregateRoot {
  private readonly _id: PasswordEntryId;
  private readonly _userId: string; // Primitive string, NOT UserId from Authentication context
  private _siteName: SiteName;
  private _siteUrl: SiteUrl;
  private _username: Username;
  private _encryptedPassword: EncryptedPassword;
  private _category: Category;
  private _notes: Notes;
  private _tags: Tags;
  private readonly _createdAt: CreatedAt;
  private _updatedAt: UpdatedAt;

  public constructor(
    id: PasswordEntryId,
    userId: string,
    siteName: SiteName,
    siteUrl: SiteUrl,
    username: Username,
    encryptedPassword: EncryptedPassword,
    category: Category,
    notes: Notes,
    tags: Tags,
    createdAt: CreatedAt,
    updatedAt: UpdatedAt
  ) {
    super();
    this._id = id;
    this._userId = userId;
    this._siteName = siteName;
    this._siteUrl = siteUrl;
    this._username = username;
    this._encryptedPassword = encryptedPassword;
    this._category = category;
    this._notes = notes;
    this._tags = tags;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  /**
   * Factory method to create a new PasswordEntry.
   * This is the primary way to create a password entry.
   *
   * @param userId - The owner of this password entry
   * @param siteName - The name of the site/app
   * @param username - The username for the site
   * @param encryptedPassword - The encrypted password
   * @param category - The category of the entry
   * @param siteUrl - Optional URL of the site
   * @param notes - Optional notes
   * @param tags - Optional tags
   * @returns PasswordEntry - New password entry instance
   */
  public static create(
    userId: string,
    siteName: SiteName,
    username: Username,
    encryptedPassword: EncryptedPassword,
    category: Category,
    siteUrl?: SiteUrl,
    notes?: Notes,
    tags?: Tags
  ): PasswordEntry {
    const id = PasswordEntryId.generate();
    const now = new Date();
    const createdAt = new CreatedAt(now);
    const updatedAt = new UpdatedAt(now);

    return new PasswordEntry(
      id,
      userId,
      siteName,
      siteUrl ?? SiteUrl.empty(),
      username,
      encryptedPassword,
      category,
      notes ?? Notes.empty(),
      tags ?? Tags.empty(),
      createdAt,
      updatedAt
    );
  }

  // Getters
  public get id(): PasswordEntryId {
    return this._id;
  }

  public get userId(): string {
    return this._userId;
  }

  public get siteName(): SiteName {
    return this._siteName;
  }

  public get siteUrl(): SiteUrl {
    return this._siteUrl;
  }

  public get username(): Username {
    return this._username;
  }

  public get encryptedPassword(): EncryptedPassword {
    return this._encryptedPassword;
  }

  public get category(): Category {
    return this._category;
  }

  public get notes(): Notes {
    return this._notes;
  }

  public get tags(): Tags {
    return this._tags;
  }

  public get createdAt(): CreatedAt {
    return this._createdAt;
  }

  public get updatedAt(): UpdatedAt {
    return this._updatedAt;
  }

  /**
   * Checks if this password entry belongs to the specified user.
   *
   * @param userId - The user ID to check
   * @returns true if the entry belongs to the user, false otherwise
   */
  public belongsToUser(userId: string): boolean {
    return this._userId === userId;
  }

  /**
   * Ensures that the specified user is the owner of this entry.
   * Throws exception if not.
   *
   * @param userId - The user ID to verify
   * @throws UnauthorizedPasswordEntryAccessException if user is not the owner
   */
  public ensureBelongsToUser(userId: string): void {
    if (!this.belongsToUser(userId)) {
      throw new UnauthorizedPasswordEntryAccessException();
    }
  }

  /**
   * Updates the site name.
   * Only the owner can perform this action.
   *
   * @param newSiteName - The new site name
   * @param userId - The user attempting the change
   */
  public updateSiteName(newSiteName: SiteName, userId: string): void {
    this.ensureBelongsToUser(userId);
    this._siteName = newSiteName;
    this._updatedAt = UpdatedAt.now();
  }

  /**
   * Updates the site URL.
   * Only the owner can perform this action.
   *
   * @param newSiteUrl - The new site URL
   * @param userId - The user attempting the change
   */
  public updateSiteUrl(newSiteUrl: SiteUrl, userId: string): void {
    this.ensureBelongsToUser(userId);
    this._siteUrl = newSiteUrl;
    this._updatedAt = UpdatedAt.now();
  }

  /**
   * Updates the username.
   * Only the owner can perform this action.
   *
   * @param newUsername - The new username
   * @param userId - The user attempting the change
   */
  public updateUsername(newUsername: Username, userId: string): void {
    this.ensureBelongsToUser(userId);
    this._username = newUsername;
    this._updatedAt = UpdatedAt.now();
  }

  /**
   * Updates the encrypted password.
   * Only the owner can perform this action.
   *
   * @param newEncryptedPassword - The new encrypted password
   * @param userId - The user attempting the change
   */
  public updatePassword(newEncryptedPassword: EncryptedPassword, userId: string): void {
    this.ensureBelongsToUser(userId);
    this._encryptedPassword = newEncryptedPassword;
    this._updatedAt = UpdatedAt.now();
  }

  /**
   * Updates the category.
   * Only the owner can perform this action.
   *
   * @param newCategory - The new category
   * @param userId - The user attempting the change
   */
  public updateCategory(newCategory: Category, userId: string): void {
    this.ensureBelongsToUser(userId);
    this._category = newCategory;
    this._updatedAt = UpdatedAt.now();
  }

  /**
   * Updates the notes.
   * Only the owner can perform this action.
   *
   * @param newNotes - The new notes
   * @param userId - The user attempting the change
   */
  public updateNotes(newNotes: Notes, userId: string): void {
    this.ensureBelongsToUser(userId);
    this._notes = newNotes;
    this._updatedAt = UpdatedAt.now();
  }

  /**
   * Updates the tags.
   * Only the owner can perform this action.
   *
   * @param newTags - The new tags
   * @param userId - The user attempting the change
   */
  public updateTags(newTags: Tags, userId: string): void {
    this.ensureBelongsToUser(userId);
    this._tags = newTags;
    this._updatedAt = UpdatedAt.now();
  }

  /**
   * Entity equality based on ID.
   */
  public equals(other: PasswordEntry): boolean {
    if (!other || !(other instanceof PasswordEntry)) {
      return false;
    }
    return this._id.equals(other._id);
  }

  /**
   * Converts the aggregate to primitives for persistence.
   */
  public toPrimitives(): {
    id: string;
    userId: string;
    siteName: string;
    siteUrl: string | null;
    username: string;
    encryptedPassword: string;
    category: string;
    notes: string | null;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this._id.value,
      userId: this._userId,
      siteName: this._siteName.value,
      siteUrl: this._siteUrl.value,
      username: this._username.value,
      encryptedPassword: this._encryptedPassword.value,
      category: this._category.value,
      notes: this._notes.value,
      tags: this._tags.toStringArray(),
      createdAt: this._createdAt.value,
      updatedAt: this._updatedAt.value,
    };
  }
}
