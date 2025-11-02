/**
 * Port: PasswordEntryRepository
 *
 * Application layer port (interface) that will be implemented by the
 * PasswordVault context infrastructure layer.
 *
 * This port enables the ChangeMasterPassword use case to coordinate
 * re-encryption of password entries across bounded contexts.
 *
 * Design Notes:
 * - Uses domain language (not technical implementation details)
 * - Returns simple primitives for cross-context communication
 * - The actual PasswordEntry aggregate lives in PasswordVault context
 * - This is an Anti-Corruption Layer (ACL) pattern
 */
export interface PasswordEntryRepository {
  /**
   * Find all password entries belonging to a specific user
   *
   * @param userId - The unique identifier of the user
   * @returns Promise<PasswordEntryData[]> - Array of password entry primitives
   */
  findByUserId(userId: string): Promise<PasswordEntryData[]>;

  /**
   * Bulk update encrypted passwords for multiple entries
   *
   * This operation should be atomic - either all entries are updated
   * or none are updated (transaction boundary).
   *
   * @param entries - Array of password entries with new encrypted passwords
   * @returns Promise<void>
   */
  bulkUpdateEncryptedPasswords(entries: PasswordEntryData[]): Promise<void>;
}

/**
 * PasswordEntryData
 *
 * Simple data structure for cross-context communication.
 * This is NOT a domain object, just a data carrier (DTO).
 *
 * Contains only the fields needed for re-encryption:
 * - id: Unique identifier
 * - encryptedPassword: The encrypted password value
 */
export interface PasswordEntryData {
  id: string;
  encryptedPassword: string;
}
