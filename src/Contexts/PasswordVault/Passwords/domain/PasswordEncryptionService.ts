import { EncryptedPassword } from './EncryptedPassword';

/**
 * PasswordEncryptionService Port
 *
 * Domain service interface for encrypting and decrypting passwords.
 * This is a PORT in Hexagonal Architecture - the implementation will be in Infrastructure layer.
 *
 * Implementation will use AES-256-GCM encryption.
 */
export interface PasswordEncryptionService {
  /**
   * Encrypts a plain text password using AES-256-GCM.
   *
   * @param plainPassword - The password in plain text
   * @param userId - The user ID (used as part of encryption context)
   * @returns EncryptedPassword containing the encrypted data
   */
  encrypt(plainPassword: string, userId: string): Promise<EncryptedPassword>;

  /**
   * Decrypts an encrypted password back to plain text.
   *
   * @param encryptedPassword - The encrypted password value object
   * @param userId - The user ID (used as part of encryption context)
   * @returns The decrypted password in plain text
   * @throws Error if decryption fails (wrong key, corrupted data, etc.)
   */
  decrypt(encryptedPassword: EncryptedPassword, userId: string): Promise<string>;
}
