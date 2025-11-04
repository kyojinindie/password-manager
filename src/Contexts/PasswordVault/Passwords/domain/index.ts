/**
 * PasswordVault Domain Layer - Public API
 *
 * This barrel file exports all domain entities, value objects, services, and exceptions
 * for the Password Vault bounded context.
 */

// Aggregate Root
export { PasswordEntry } from './PasswordEntry';

// Value Objects
export { PasswordEntryId } from './PasswordEntryId';
export { SiteName } from './SiteName';
export { SiteUrl } from './SiteUrl';
export { Username } from './Username';
export { EncryptedPassword } from './EncryptedPassword';
export { Category, CategoryType } from './Category';
export { Notes } from './Notes';
export { Tag } from './Tag';
export { Tags } from './Tags';
export { CreatedAt } from './CreatedAt';
export { UpdatedAt } from './UpdatedAt';

// Domain Services (Ports)
export { PasswordEncryptionService } from './PasswordEncryptionService';

// Repository (Port)
export { PasswordEntryRepository } from './PasswordEntryRepository';

// Domain Exceptions
export { InvalidSiteNameException } from './InvalidSiteNameException';
export { InvalidSiteUrlException } from './InvalidSiteUrlException';
export { InvalidUsernameException } from './InvalidUsernameException';
export { InvalidEncryptedPasswordException } from './InvalidEncryptedPasswordException';
export { InvalidCategoryException } from './InvalidCategoryException';
export { InvalidNotesException } from './InvalidNotesException';
export { InvalidTagException } from './InvalidTagException';
export { UnauthorizedPasswordEntryAccessException } from './UnauthorizedPasswordEntryAccessException';
