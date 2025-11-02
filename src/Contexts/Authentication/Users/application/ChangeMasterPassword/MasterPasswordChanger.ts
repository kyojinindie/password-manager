import { UserRepository } from '../../domain/UserRepository';
import { MasterPasswordHashingService } from '../../domain/MasterPasswordHashingService';
import { PasswordEntryRepository } from '../ports/PasswordEntryRepository';
import { PasswordEncryptionService } from '../ports/PasswordEncryptionService';
import { UserId } from '../../domain/UserId';
import { MasterPasswordHash } from '../../domain/MasterPasswordHash';
import { Salt } from '../../domain/Salt';
import { InvalidCredentialsException } from '../../domain/InvalidCredentialsException';
import { UserNotFoundException } from '../../domain/UserNotFoundException';
import { ChangeMasterPasswordRequest } from './ChangeMasterPasswordRequest';
import { ChangeMasterPasswordResponse } from './ChangeMasterPasswordResponse';

/**
 * Application Service: MasterPasswordChanger
 *
 * Orchestrates the complex operation of changing a user's master password,
 * which requires coordinating updates across multiple aggregates and contexts.
 *
 * This operation is critical because the master password is used to:
 * 1. Authenticate the user (hashed and stored)
 * 2. Encrypt all password entries (symmetric encryption)
 *
 * When changing the master password, we must:
 * - Update the user's password hash
 * - Re-encrypt ALL password entries with the new master password
 * - Ensure atomic operation (all or nothing)
 *
 * Responsibilities:
 * - Orchestrate the multi-step change password workflow
 * - Coordinate between Authentication and PasswordVault contexts
 * - Manage transaction boundaries (ensure atomicity)
 * - Convert between DTOs and domain objects
 * - Delegate business logic to domain objects
 * - Delegate infrastructure concerns to ports
 *
 * Does NOT:
 * - Contain business logic (domain responsibility)
 * - Validate password complexity (domain service responsibility)
 * - Perform encryption directly (infrastructure responsibility)
 * - Access databases directly (repository responsibility)
 */
export class MasterPasswordChanger {
  public constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordEntryRepository: PasswordEntryRepository,
    private readonly hashingService: MasterPasswordHashingService,
    private readonly encryptionService: PasswordEncryptionService
  ) {}

  /**
   * Execute the change master password operation
   *
   * Orchestration flow:
   * 1. Validate and convert userId to UserId VO
   * 2. Find user by id (ensure exists)
   * 3. Verify current master password (authenticate user)
   * 4. Validate new password complexity (domain service)
   * 5. Find all password entries belonging to user
   * 6. Re-encrypt all password entries with new master password
   * 7. Update user's master password hash
   * 8. Save updated user (transaction boundary start)
   * 9. Save all re-encrypted password entries (transaction boundary)
   * 10. Return success response with metadata
   *
   * Transaction Notes:
   * This operation MUST be atomic. If re-encrypting password entries fails,
   * the user's master password should NOT be updated. This requires either:
   * - Database transaction spanning both repositories
   * - Two-phase commit
   * - Saga pattern
   *
   * For now, we rely on sequential operations and error handling.
   * In production, wrap in a UnitOfWork/Transaction pattern.
   *
   * @param request - Contains userId, current password, and new password
   * @returns Promise<ChangeMasterPasswordResponse> - Operation confirmation
   * @throws UserNotFoundException if user doesn't exist
   * @throws InvalidCredentialsException if current password is wrong
   * @throws Error if new password doesn't meet complexity requirements
   * @throws Error if re-encryption fails (e.g., corrupted password entries)
   */
  public async run(
    request: ChangeMasterPasswordRequest
  ): Promise<ChangeMasterPasswordResponse> {
    // Step 1: Convert userId string to UserId VO
    const userId = new UserId(request.userId);

    // Step 2: Find user by id
    // Delegate to repository (infrastructure port)
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(request.userId);
    }

    // Step 3: Verify current master password
    // Delegate to domain entity for business logic
    const isCurrentPasswordValid = await user.verifyPassword(
      request.currentMasterPassword,
      this.hashingService
    );

    if (!isCurrentPasswordValid) {
      // User provided wrong current password - cannot change
      throw new InvalidCredentialsException();
    }

    // Step 4: Validate new password complexity
    // Delegate to domain service for validation rules
    this.hashingService.validatePasswordComplexity(request.newMasterPassword);

    // Step 5: Find all password entries belonging to this user
    // Delegate to PasswordVault repository (cross-context coordination)
    const passwordEntries = await this.passwordEntryRepository.findByUserId(
      request.userId
    );

    // Step 6: Re-encrypt all password entries with new master password
    // This is the most critical and potentially time-consuming operation
    // Delegate encryption logic to infrastructure service
    const reEncryptedEntries = await this.reEncryptAllPasswordEntries(
      passwordEntries,
      request.currentMasterPassword,
      request.newMasterPassword
    );

    // Step 7: Generate new password hash and salt for user
    // Delegate to domain service
    const newSalt = await this.hashingService.generateSalt();
    const newHashedPassword = await this.hashingService.hash(request.newMasterPassword);

    const newMasterPasswordHash = new MasterPasswordHash(newHashedPassword);
    const newSaltVO = new Salt(newSalt);

    // Step 8: Update user's master password
    // Delegate to domain entity method which returns a new User instance
    // following immutability principles (User aggregate has readonly fields)
    const updatedUser = user.changeMasterPassword(newMasterPasswordHash, newSaltVO);

    // Step 9: Save updated user (transaction boundary)
    // Delegate to repository
    await this.userRepository.save(updatedUser);

    // Step 10: Save all re-encrypted password entries (transaction boundary)
    // This MUST succeed if user save succeeded (atomicity requirement)
    // Delegate to PasswordVault repository
    await this.passwordEntryRepository.bulkUpdateEncryptedPasswords(reEncryptedEntries);

    // Step 11: Return success response with operation metadata
    return {
      userId: user.id.value,
      passwordEntriesReEncrypted: reEncryptedEntries.length,
      changedAt: new Date(),
    };
  }

  /**
   * Re-encrypt all password entries from old master password to new one
   *
   * Private orchestration helper method.
   *
   * This method coordinates the re-encryption of potentially many password
   * entries. Each entry must be:
   * 1. Decrypted with old master password
   * 2. Re-encrypted with new master password
   *
   * If ANY entry fails to decrypt, the entire operation should fail
   * (fail-fast approach to prevent data loss).
   *
   * @param entries - Array of password entry data with encrypted passwords
   * @param oldMasterPassword - Current master password (for decryption)
   * @param newMasterPassword - New master password (for encryption)
   * @returns Promise<PasswordEntryData[]> - Entries with new encrypted passwords
   * @throws Error if any re-encryption fails
   */
  private async reEncryptAllPasswordEntries(
    entries: Array<{ id: string; encryptedPassword: string }>,
    oldMasterPassword: string,
    newMasterPassword: string
  ): Promise<Array<{ id: string; encryptedPassword: string }>> {
    // Use Promise.all for parallel re-encryption (faster for many entries)
    // Alternative: Sequential processing with for-of loop (safer but slower)
    const reEncryptedEntries = await Promise.all(
      entries.map(async entry => {
        try {
          // Delegate re-encryption to infrastructure service
          const newEncryptedPassword = await this.encryptionService.reEncrypt(
            entry.encryptedPassword,
            oldMasterPassword,
            newMasterPassword
          );

          return {
            id: entry.id,
            encryptedPassword: newEncryptedPassword,
          };
        } catch (error) {
          // Re-encryption failed - this is critical
          // Possible causes: corrupted data, wrong password, crypto error
          throw new Error(
            `Failed to re-encrypt password entry ${entry.id}: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`
          );
        }
      })
    );

    return reEncryptedEntries;
  }
}
