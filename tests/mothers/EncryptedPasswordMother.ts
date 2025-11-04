import { faker } from '@faker-js/faker';
import { EncryptedPassword } from '../../src/Contexts/PasswordVault/Passwords/domain/EncryptedPassword';

export class EncryptedPasswordMother {
  public static create(value: string): EncryptedPassword {
    return new EncryptedPassword(value);
  }

  public static random(): EncryptedPassword {
    // Simulates AES-256-GCM encrypted data in base64
    const encryptedData = faker.string.alphanumeric(64);
    return new EncryptedPassword(encryptedData);
  }

  public static withValue(value: string): EncryptedPassword {
    return new EncryptedPassword(value);
  }

  public static validEncrypted(): EncryptedPassword {
    // Simulates realistic encrypted password format
    return new EncryptedPassword(
      'U2FsdGVkX1+F3D8J9K2L5M6N7O8P9Q0R1S2T3U4V5W6X7Y8Z9A0B1C2D3E4F5G6H'
    );
  }

  public static minLength(): EncryptedPassword {
    return new EncryptedPassword('a'.repeat(32));
  }

  public static longEncrypted(): EncryptedPassword {
    return new EncryptedPassword(faker.string.alphanumeric(128));
  }

  public static invalidEmpty(): string {
    return '';
  }

  public static invalidBlank(): string {
    return '   ';
  }

  public static invalidTooShort(): string {
    return 'short';
  }

  public static invalidLength31(): string {
    return 'a'.repeat(31);
  }

  public static invalidNull(): any {
    return null;
  }

  public static invalidUndefined(): any {
    return undefined;
  }
}
