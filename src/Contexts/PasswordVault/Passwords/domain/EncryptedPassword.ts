import { ValueObject } from '../../../Shared/domain/ValueObject';
import { InvalidEncryptedPasswordException } from './InvalidEncryptedPasswordException';

/**
 * EncryptedPassword Value Object
 *
 * Represents an AES-256-GCM encrypted password.
 * This VO is completely immutable and stores the encrypted data.
 *
 * Format: The encrypted value includes:
 * - IV (Initialization Vector)
 * - Encrypted data
 * - Auth tag
 *
 * All combined in a single string format (implementation detail of the encryption service).
 */
export class EncryptedPassword extends ValueObject<string> {
  public constructor(encryptedValue: string) {
    EncryptedPassword.ensureIsValid(encryptedValue);
    super(encryptedValue);
  }

  private static ensureIsValid(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new InvalidEncryptedPasswordException('Encrypted password cannot be empty');
    }

    // Basic validation: encrypted data should have minimum length
    // AES-256-GCM with IV and auth tag should produce at least 32 chars in base64
    if (value.length < 32) {
      throw new InvalidEncryptedPasswordException(
        'Encrypted password format is invalid: too short'
      );
    }
  }

  /**
   * Returns true if this encrypted password appears to be valid encrypted data.
   * This is a basic check, actual decryption will be the final validation.
   */
  public isValid(): boolean {
    return !!(this._value && this._value.length >= 32);
  }
}
