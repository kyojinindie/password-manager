import {
  PasswordEntryRepository,
  PasswordEntryData,
} from '../application/ports/PasswordEntryRepository';

/**
 * In-Memory Password Entry Repository - Secondary Adapter (Cross-Context)
 *
 * Temporary implementation of PasswordEntryRepository for development and testing.
 * This adapter simulates accessing password entries from the PasswordVault context.
 *
 * This is a SECONDARY (driven/output) adapter in Hexagonal Architecture.
 *
 * Architecture Notes:
 * - Implements the application layer port (interface)
 * - Simulates cross-context communication with PasswordVault context
 * - In production, this would be replaced with a real implementation that:
 *   * Calls PasswordVault context's repository via shared database
 *   * Or calls PasswordVault context's API/service
 *   * Or uses messaging/events for async communication
 *
 * Anti-Corruption Layer (ACL) Pattern:
 * - This adapter protects Authentication context from PasswordVault internals
 * - It translates between contexts using simple DTOs (PasswordEntryData)
 * - The PasswordEntry aggregate lives in PasswordVault context
 * - Authentication context doesn't know about PasswordEntry domain objects
 *
 * Cross-Context Communication:
 * - This is a bounded context integration point
 * - Authentication context needs to coordinate with PasswordVault context
 * - We use a shared interface (port) defined in Authentication context
 * - Implementation details are hidden behind the port
 *
 * Development Notes:
 * - For now, stores password entries in memory (Map)
 * - Data is lost when process restarts
 * - Not suitable for production use
 * - Replace with real implementation once PasswordVault context exists
 *
 * Responsibilities:
 * - Find all password entries for a user
 * - Bulk update encrypted passwords
 * - Simulate atomic operations (transaction simulation)
 *
 * What this adapter DOES NOT do:
 * - Create new password entries (not needed for change password)
 * - Delete password entries (not needed for change password)
 * - Expose PasswordEntry domain objects (uses DTOs)
 * - Implement PasswordVault business logic
 */
export class InMemoryPasswordEntryRepository implements PasswordEntryRepository {
  // In-memory storage: Map<userId, Array<PasswordEntryData>>
  // This simulates a database table of password entries grouped by user
  private readonly passwordEntries: Map<string, PasswordEntryData[]> = new Map();

  /**
   * Find all password entries belonging to a specific user
   *
   * In a real implementation, this would:
   * - Query the PasswordVault context's database
   * - Or call a PasswordVault context service/API
   * - Or retrieve from a shared read model
   *
   * @param userId - The unique identifier of the user
   * @returns Promise<PasswordEntryData[]> - Array of password entry primitives
   *
   * Returns empty array if:
   * - User has no password entries
   * - User doesn't exist
   * - This is safe behavior (no entries to re-encrypt)
   */
  public async findByUserId(userId: string): Promise<PasswordEntryData[]> {
    // Retrieve entries for this user (or empty array if none)
    const entries = this.passwordEntries.get(userId) ?? [];

    // Return a copy to prevent external mutation
    // Wrap in Promise.resolve to satisfy async requirement
    return Promise.resolve(entries.map(entry => ({ ...entry })));
  }

  /**
   * Bulk update encrypted passwords for multiple entries
   *
   * This operation should be atomic in production:
   * - Either all entries are updated or none are updated
   * - Use database transaction
   * - Or use two-phase commit for cross-context updates
   * - Or use saga pattern for distributed transaction
   *
   * In a real implementation, this would:
   * - Start a database transaction
   * - Update all password entries in PasswordVault context
   * - Commit transaction if all succeed
   * - Rollback if any fail
   *
   * @param entries - Array of password entries with new encrypted passwords
   * @returns Promise<void>
   * @throws Error if update fails (simulated)
   *
   * Transaction Notes:
   * This in-memory implementation simulates atomicity:
   * - Validates all entries first
   * - Updates all entries in one operation
   * - If validation fails, no entries are updated
   */
  public async bulkUpdateEncryptedPasswords(entries: PasswordEntryData[]): Promise<void> {
    // Validate entries before updating (simulate transaction validation phase)
    this.validateEntries(entries);

    // Group entries by userId for efficient updates
    const entriesByUser = this.groupEntriesByUserId(entries);

    // Update entries for each user
    // In production, this would be a single database transaction
    for (const [userId, userEntries] of entriesByUser.entries()) {
      // Get existing entries for this user
      const existingEntries = this.passwordEntries.get(userId) ?? [];

      // Create a map of entry IDs for quick lookup
      const updatesById = new Map(
        userEntries.map(entry => [entry.id, entry.encryptedPassword])
      );

      // Update encrypted passwords for matching entries
      const updatedEntries = existingEntries.map(existing => {
        const newEncryptedPassword = updatesById.get(existing.id);
        if (newEncryptedPassword !== undefined) {
          // Entry was updated - use new encrypted password
          return {
            ...existing,
            encryptedPassword: newEncryptedPassword,
          };
        }
        // Entry not in update list - keep unchanged
        return existing;
      });

      // Save updated entries back to storage
      this.passwordEntries.set(userId, updatedEntries);
    }

    // Wrap in Promise.resolve to satisfy async requirement
    return Promise.resolve();
  }

  /**
   * TESTING HELPER: Add password entries to the repository
   *
   * This method is NOT part of the PasswordEntryRepository interface.
   * It's provided for testing and development purposes only.
   *
   * In production, password entries would be created through the
   * PasswordVault context's proper use cases (CreatePasswordEntry, etc.)
   *
   * @param userId - The user who owns these entries
   * @param entries - Array of password entries to add
   */
  public async addPasswordEntriesForUser(
    userId: string,
    entries: PasswordEntryData[]
  ): Promise<void> {
    const existingEntries = this.passwordEntries.get(userId) ?? [];
    this.passwordEntries.set(userId, [...existingEntries, ...entries]);
    return Promise.resolve();
  }

  /**
   * TESTING HELPER: Clear all password entries
   *
   * This method is NOT part of the PasswordEntryRepository interface.
   * It's provided for testing purposes only.
   */
  public async clear(): Promise<void> {
    this.passwordEntries.clear();
    return Promise.resolve();
  }

  /**
   * TESTING HELPER: Get count of password entries for a user
   *
   * This method is NOT part of the PasswordEntryRepository interface.
   * It's provided for testing purposes only.
   */
  public countByUserId(userId: string): number {
    const entries = this.passwordEntries.get(userId) ?? [];
    return entries.length;
  }

  /**
   * Validates password entry data before update
   *
   * Checks:
   * - Entry has id field
   * - Entry has encryptedPassword field
   * - Fields are not empty
   * - Fields are strings
   *
   * @param entries - Entries to validate
   * @throws Error if validation fails
   *
   * Private helper method
   */
  private validateEntries(entries: PasswordEntryData[]): void {
    for (const entry of entries) {
      // Validate id field
      if (!entry.id || typeof entry.id !== 'string' || entry.id.trim() === '') {
        throw new Error(
          'Invalid password entry: id is required and must be a non-empty string'
        );
      }

      // Validate encryptedPassword field
      if (
        !entry.encryptedPassword ||
        typeof entry.encryptedPassword !== 'string' ||
        entry.encryptedPassword.trim() === ''
      ) {
        throw new Error(
          'Invalid password entry: encryptedPassword is required and must be a non-empty string'
        );
      }
    }
  }

  /**
   * Groups password entries by user ID
   *
   * Converts flat array into Map<userId, entries[]> for efficient processing
   *
   * @param entries - Flat array of password entries
   * @returns Map of userId to entries
   *
   * Private helper method
   *
   * Note: This assumes entries have a way to identify their owner (userId)
   * In production, you'd need to query the PasswordVault context to get
   * the userId for each entry, or include userId in PasswordEntryData.
   *
   * For this implementation, we'll need to maintain userId associations
   * when entries are added via addPasswordEntriesForUser()
   */
  private groupEntriesByUserId(
    entries: PasswordEntryData[]
  ): Map<string, PasswordEntryData[]> {
    // In this in-memory implementation, we need to find which user owns each entry
    // We do this by searching through all users' entries
    const grouped = new Map<string, PasswordEntryData[]>();

    for (const entry of entries) {
      // Find which user owns this entry
      const userId = this.findUserIdForEntry(entry.id);

      if (userId) {
        // Add to this user's group
        const userEntries = grouped.get(userId) ?? [];
        userEntries.push(entry);
        grouped.set(userId, userEntries);
      } else {
        // Entry not found - this is an error
        throw new Error(`Password entry with id '${entry.id}' not found in repository`);
      }
    }

    return grouped;
  }

  /**
   * Finds which user owns a specific password entry
   *
   * @param entryId - The entry ID to find
   * @returns userId or null if not found
   *
   * Private helper method
   */
  private findUserIdForEntry(entryId: string): string | null {
    // Search through all users' entries
    for (const [userId, entries] of this.passwordEntries.entries()) {
      const found = entries.some(entry => entry.id === entryId);
      if (found) {
        return userId;
      }
    }

    return null;
  }
}
