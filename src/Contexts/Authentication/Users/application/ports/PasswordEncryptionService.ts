/**
 * Port: PasswordEncryptionService
 *
 * Application layer port (interface) for password encryption/decryption
 * operations using the master password as the encryption key.
 *
 * This service handles the cryptographic operations needed to:
 * 1. Decrypt passwords using the old master password
 * 2. Re-encrypt passwords using the new master password
 *
 * Design Notes:
 * - Uses domain language (not implementation details like "AES-256")
 * - Will be implemented by infrastructure layer (crypto adapter)
 * - Separated from MasterPasswordHashingService (different concerns)
 * - Hashing (bcrypt) vs Encryption (symmetric crypto) are different operations
 *
 * Security Note:
 * The actual encryption key derivation from master password should be
 * handled by the infrastructure implementation (e.g., PBKDF2, Argon2).
 */
export interface PasswordEncryptionService {
  /**
   * Decrypt a password entry using the master password
   *
   * @param encryptedPassword - The encrypted password string
   * @param masterPassword - The user's master password (plain text)
   * @returns Promise<string> - The decrypted password (plain text)
   * @throws Error if decryption fails (wrong master password or corrupted data)
   */
  decrypt(encryptedPassword: string, masterPassword: string): Promise<string>;

  /**
   * Encrypt a password entry using the master password
   *
   * @param plainPassword - The password to encrypt (plain text)
   * @param masterPassword - The user's master password (plain text)
   * @returns Promise<string> - The encrypted password string
   * @throws Error if encryption fails
   */
  encrypt(plainPassword: string, masterPassword: string): Promise<string>;

  /**
   * Re-encrypt a password from old master password to new master password
   *
   * This is a convenience method that combines decrypt + encrypt.
   * Useful for bulk re-encryption operations.
   *
   * @param encryptedPassword - The currently encrypted password
   * @param oldMasterPassword - The old master password (plain text)
   * @param newMasterPassword - The new master password (plain text)
   * @returns Promise<string> - The password re-encrypted with new master password
   * @throws Error if decryption or encryption fails
   */
  reEncrypt(
    encryptedPassword: string,
    oldMasterPassword: string,
    newMasterPassword: string
  ): Promise<string>;
}
