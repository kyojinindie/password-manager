import * as crypto from 'crypto';
import { PasswordEncryptionService } from '../application/ports/PasswordEncryptionService';

/**
 * Password Encryption Service Implementation - Secondary Adapter
 *
 * Implements the PasswordEncryptionService port using Node.js crypto module
 * with AES-256-GCM (Galois/Counter Mode) for authenticated encryption.
 *
 * This is a SECONDARY (driven/output) adapter in Hexagonal Architecture.
 *
 * Architecture Notes:
 * - Implements the application layer port (interface)
 * - Encapsulates all cryptographic implementation details
 * - Domain/Application layers don't know about AES, GCM, PBKDF2, etc.
 * - If we need to change encryption algorithm, only this file changes
 *
 * Cryptographic Design:
 * - Algorithm: AES-256-GCM (authenticated encryption with associated data)
 * - Key Derivation: PBKDF2 with SHA-256 (derives 256-bit key from password)
 * - Salt: Random 16 bytes per encryption (stored with ciphertext)
 * - IV (Initialization Vector): Random 12 bytes per encryption
 * - Auth Tag: 16 bytes (ensures integrity and authenticity)
 *
 * Encrypted Data Format:
 * - Base64 encoded string containing: salt:iv:authTag:ciphertext
 * - Example: "abcd1234...:ef56...:gh78...:ij90..."
 * - This format allows decryption by parsing components
 *
 * Security Properties:
 * - Confidentiality: AES-256 encryption
 * - Integrity: GCM authentication tag
 * - Authenticity: GCM prevents tampering
 * - Key Derivation: PBKDF2 with 100,000 iterations
 * - Random Salt: Prevents rainbow table attacks
 * - Random IV: Each encryption is unique
 *
 * Responsibilities:
 * - Encrypt plain text passwords with master password
 * - Decrypt encrypted passwords with master password
 * - Re-encrypt passwords from old to new master password
 * - Generate cryptographically secure random salts and IVs
 * - Derive encryption keys from master passwords
 * - Format encrypted data for storage
 * - Parse encrypted data for decryption
 *
 * What this service DOES NOT do:
 * - Password complexity validation (that's domain)
 * - Password hashing for authentication (that's MasterPasswordHashingService)
 * - Store passwords (that's repository)
 * - Manage master passwords (that's domain)
 */
export class PasswordEncryptionServiceImpl implements PasswordEncryptionService {
  // Cryptographic constants
  private readonly ALGORITHM = 'aes-256-gcm' as const;
  private readonly KEY_LENGTH = 32; // 256 bits for AES-256
  private readonly SALT_LENGTH = 16; // 128 bits
  private readonly IV_LENGTH = 12; // 96 bits (recommended for GCM)
  private readonly AUTH_TAG_LENGTH = 16; // 128 bits
  private readonly PBKDF2_ITERATIONS = 100000; // Key derivation iterations
  private readonly PBKDF2_DIGEST = 'sha256' as const;

  /**
   * Encrypts a plain text password using the master password
   *
   * Process:
   * 1. Generate random salt (16 bytes)
   * 2. Derive encryption key from master password using PBKDF2
   * 3. Generate random IV (12 bytes)
   * 4. Encrypt plain password with AES-256-GCM
   * 5. Extract authentication tag (16 bytes)
   * 6. Format as: salt:iv:authTag:ciphertext (all base64 encoded)
   *
   * @param plainPassword - The password to encrypt (plain text)
   * @param masterPassword - The user's master password (plain text)
   * @returns Promise<string> - Base64 encoded encrypted data
   * @throws Error if encryption fails
   */
  public async encrypt(plainPassword: string, masterPassword: string): Promise<string> {
    try {
      // Step 1: Generate random salt for key derivation
      const salt = crypto.randomBytes(this.SALT_LENGTH);

      // Step 2: Derive encryption key from master password
      const key = await this.deriveKey(masterPassword, salt);

      // Step 3: Generate random IV (initialization vector)
      const iv = crypto.randomBytes(this.IV_LENGTH);

      // Step 4: Create cipher with AES-256-GCM
      const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);

      // Step 5: Encrypt the plain password
      const encrypted = Buffer.concat([
        cipher.update(plainPassword, 'utf8'),
        cipher.final(),
      ]);

      // Step 6: Get authentication tag (provides integrity and authenticity)
      const authTag = cipher.getAuthTag();

      // Step 7: Format as salt:iv:authTag:ciphertext (all base64)
      const encryptedData = this.formatEncryptedData(salt, iv, authTag, encrypted);

      return encryptedData;
    } catch (error) {
      throw new Error(
        `Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Decrypts an encrypted password using the master password
   *
   * Process:
   * 1. Parse encrypted data into components (salt, iv, authTag, ciphertext)
   * 2. Derive decryption key from master password using PBKDF2
   * 3. Decrypt ciphertext with AES-256-GCM
   * 4. Verify authentication tag (ensures data integrity)
   * 5. Return plain text password
   *
   * @param encryptedPassword - The encrypted password string
   * @param masterPassword - The user's master password (plain text)
   * @returns Promise<string> - The decrypted password (plain text)
   * @throws Error if decryption fails (wrong password, corrupted data, etc.)
   */
  public async decrypt(
    encryptedPassword: string,
    masterPassword: string
  ): Promise<string> {
    try {
      // Step 1: Parse encrypted data into components
      const { salt, iv, authTag, ciphertext } =
        this.parseEncryptedData(encryptedPassword);

      // Step 2: Derive decryption key from master password
      // Must use the same salt that was used for encryption
      const key = await this.deriveKey(masterPassword, salt);

      // Step 3: Create decipher with AES-256-GCM
      const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);

      // Step 4: Set authentication tag for verification
      // GCM will verify integrity during decryption
      decipher.setAuthTag(authTag);

      // Step 5: Decrypt the ciphertext
      // If auth tag doesn't match, this will throw an error
      const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);

      // Step 6: Convert buffer to UTF-8 string
      return decrypted.toString('utf8');
    } catch (error) {
      // Decryption can fail for several reasons:
      // - Wrong master password (auth tag won't match)
      // - Corrupted encrypted data
      // - Invalid format
      throw new Error(
        `Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Re-encrypts a password from old master password to new master password
   *
   * This is a convenience method that combines decrypt + encrypt.
   * Used by the ChangeMasterPassword use case to re-encrypt all password entries.
   *
   * Process:
   * 1. Decrypt with old master password
   * 2. Encrypt with new master password
   * 3. Return new encrypted string
   *
   * @param encryptedPassword - The currently encrypted password
   * @param oldMasterPassword - The old master password (plain text)
   * @param newMasterPassword - The new master password (plain text)
   * @returns Promise<string> - The password re-encrypted with new master password
   * @throws Error if decryption or encryption fails
   */
  public async reEncrypt(
    encryptedPassword: string,
    oldMasterPassword: string,
    newMasterPassword: string
  ): Promise<string> {
    try {
      // Step 1: Decrypt with old master password
      const plainPassword = await this.decrypt(encryptedPassword, oldMasterPassword);

      // Step 2: Encrypt with new master password
      const newEncryptedPassword = await this.encrypt(plainPassword, newMasterPassword);

      return newEncryptedPassword;
    } catch (error) {
      // Re-encryption can fail if:
      // - Old master password is wrong (decryption fails)
      // - Encrypted data is corrupted (decryption fails)
      // - Encryption fails (rare, usually system error)
      throw new Error(
        `Re-encryption failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Derives an encryption key from a master password using PBKDF2
   *
   * PBKDF2 (Password-Based Key Derivation Function 2) is designed to:
   * - Derive a cryptographically strong key from a password
   * - Make brute-force attacks expensive (100,000 iterations)
   * - Use a salt to prevent rainbow table attacks
   *
   * @param masterPassword - The master password (plain text)
   * @param salt - Random salt buffer (16 bytes)
   * @returns Promise<Buffer> - Derived encryption key (32 bytes)
   *
   * Private helper method (not part of interface)
   */
  private async deriveKey(masterPassword: string, salt: Buffer): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      crypto.pbkdf2(
        masterPassword,
        salt,
        this.PBKDF2_ITERATIONS,
        this.KEY_LENGTH,
        this.PBKDF2_DIGEST,
        (err, derivedKey) => {
          if (err) {
            reject(new Error(`Key derivation failed: ${err.message}`));
          } else {
            resolve(derivedKey);
          }
        }
      );
    });
  }

  /**
   * Formats encrypted data components into a single string
   *
   * Format: salt:iv:authTag:ciphertext (all base64 encoded)
   * Example: "abcd1234...:ef56...:gh78...:ij90..."
   *
   * This format allows:
   * - Easy storage as a single string
   * - Easy parsing during decryption
   * - All components needed for decryption are included
   *
   * @param salt - Salt buffer (16 bytes)
   * @param iv - IV buffer (12 bytes)
   * @param authTag - Auth tag buffer (16 bytes)
   * @param ciphertext - Encrypted data buffer
   * @returns Formatted string (salt:iv:authTag:ciphertext)
   *
   * Private helper method (not part of interface)
   */
  private formatEncryptedData(
    salt: Buffer,
    iv: Buffer,
    authTag: Buffer,
    ciphertext: Buffer
  ): string {
    // Convert each component to base64 and join with ':'
    const saltBase64 = salt.toString('base64');
    const ivBase64 = iv.toString('base64');
    const authTagBase64 = authTag.toString('base64');
    const ciphertextBase64 = ciphertext.toString('base64');

    return `${saltBase64}:${ivBase64}:${authTagBase64}:${ciphertextBase64}`;
  }

  /**
   * Parses encrypted data string into components
   *
   * Expected format: salt:iv:authTag:ciphertext (all base64 encoded)
   *
   * @param encryptedData - Formatted encrypted data string
   * @returns Object with salt, iv, authTag, and ciphertext buffers
   * @throws Error if format is invalid
   *
   * Private helper method (not part of interface)
   */
  private parseEncryptedData(encryptedData: string): {
    salt: Buffer;
    iv: Buffer;
    authTag: Buffer;
    ciphertext: Buffer;
  } {
    // Split by ':' to get components
    const parts = encryptedData.split(':');

    // Validate format (must have exactly 4 parts)
    if (parts.length !== 4) {
      throw new Error(
        `Invalid encrypted data format. Expected 4 parts, got ${parts.length}`
      );
    }

    const [saltBase64, ivBase64, authTagBase64, ciphertextBase64] = parts;

    // Convert from base64 to buffers
    try {
      const salt = Buffer.from(saltBase64, 'base64');
      const iv = Buffer.from(ivBase64, 'base64');
      const authTag = Buffer.from(authTagBase64, 'base64');
      const ciphertext = Buffer.from(ciphertextBase64, 'base64');

      // Validate component lengths
      if (salt.length !== this.SALT_LENGTH) {
        throw new Error(
          `Invalid salt length. Expected ${this.SALT_LENGTH}, got ${salt.length}`
        );
      }

      if (iv.length !== this.IV_LENGTH) {
        throw new Error(
          `Invalid IV length. Expected ${this.IV_LENGTH}, got ${iv.length}`
        );
      }

      if (authTag.length !== this.AUTH_TAG_LENGTH) {
        throw new Error(
          `Invalid auth tag length. Expected ${this.AUTH_TAG_LENGTH}, got ${authTag.length}`
        );
      }

      return { salt, iv, authTag, ciphertext };
    } catch (error) {
      throw new Error(
        `Failed to parse encrypted data: ${
          error instanceof Error ? error.message : 'Invalid base64 encoding'
        }`
      );
    }
  }
}
