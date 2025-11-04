import { EncryptedPasswordMother } from '../../../../mothers/EncryptedPasswordMother';
import { InvalidEncryptedPasswordException } from '../../../../../src/Contexts/PasswordVault/Passwords/domain/InvalidEncryptedPasswordException';

describe('EncryptedPassword', () => {
  describe('constructor', () => {
    it('should create EncryptedPassword with valid encrypted value', () => {
      const encryptedPassword = EncryptedPasswordMother.validEncrypted();

      expect(encryptedPassword.value).toBeDefined();
      expect(typeof encryptedPassword.value).toBe('string');
      expect(encryptedPassword.value.length).toBeGreaterThanOrEqual(32);
    });

    it('should create EncryptedPassword with random value', () => {
      const encryptedPassword = EncryptedPasswordMother.random();

      expect(encryptedPassword.value).toBeDefined();
      expect(encryptedPassword.value.length).toBeGreaterThanOrEqual(32);
    });

    it('should create EncryptedPassword at minimum length', () => {
      const encryptedPassword = EncryptedPasswordMother.minLength();

      expect(encryptedPassword.value).toHaveLength(32);
    });

    it('should create EncryptedPassword with long encrypted data', () => {
      const encryptedPassword = EncryptedPasswordMother.longEncrypted();

      expect(encryptedPassword.value.length).toBeGreaterThan(32);
    });

    it('should throw error when value is empty', () => {
      const emptyValue = EncryptedPasswordMother.invalidEmpty();

      expect(() => EncryptedPasswordMother.create(emptyValue)).toThrow(
        InvalidEncryptedPasswordException
      );
      expect(() => EncryptedPasswordMother.create(emptyValue)).toThrow(
        'Encrypted password cannot be empty'
      );
    });

    it('should throw error when value is blank', () => {
      const blankValue = EncryptedPasswordMother.invalidBlank();

      expect(() => EncryptedPasswordMother.create(blankValue)).toThrow(
        InvalidEncryptedPasswordException
      );
      expect(() => EncryptedPasswordMother.create(blankValue)).toThrow(
        'Encrypted password cannot be empty'
      );
    });

    it('should throw error when value is too short', () => {
      const tooShort = EncryptedPasswordMother.invalidTooShort();

      expect(() => EncryptedPasswordMother.create(tooShort)).toThrow(
        InvalidEncryptedPasswordException
      );
      expect(() => EncryptedPasswordMother.create(tooShort)).toThrow(
        'Encrypted password format is invalid: too short'
      );
    });

    it('should throw error when value is 31 characters', () => {
      const length31 = EncryptedPasswordMother.invalidLength31();

      expect(() => EncryptedPasswordMother.create(length31)).toThrow(
        InvalidEncryptedPasswordException
      );
      expect(() => EncryptedPasswordMother.create(length31)).toThrow(
        'Encrypted password format is invalid: too short'
      );
    });

    it('should throw error when value is null', () => {
      const nullValue = EncryptedPasswordMother.invalidNull();

      expect(() => EncryptedPasswordMother.create(nullValue)).toThrow(
        InvalidEncryptedPasswordException
      );
    });

    it('should throw error when value is undefined', () => {
      const undefinedValue = EncryptedPasswordMother.invalidUndefined();

      expect(() => EncryptedPasswordMother.create(undefinedValue)).toThrow(
        InvalidEncryptedPasswordException
      );
    });
  });

  describe('isValid', () => {
    it('should return true for valid encrypted password', () => {
      const encryptedPassword = EncryptedPasswordMother.validEncrypted();

      expect(encryptedPassword.isValid()).toBe(true);
    });

    it('should return true for minimum length encrypted password', () => {
      const encryptedPassword = EncryptedPasswordMother.minLength();

      expect(encryptedPassword.isValid()).toBe(true);
    });

    it('should return true for long encrypted password', () => {
      const encryptedPassword = EncryptedPasswordMother.longEncrypted();

      expect(encryptedPassword.isValid()).toBe(true);
    });
  });

  describe('equals', () => {
    it('should return true when comparing same encrypted values', () => {
      const value = 'U2FsdGVkX1+F3D8J9K2L5M6N7O8P9Q0R1S2T3U4V5W6X7Y8Z9A0B1C2D3E4F5G6H';
      const password1 = EncryptedPasswordMother.create(value);
      const password2 = EncryptedPasswordMother.create(value);

      expect(password1.equals(password2)).toBe(true);
    });

    it('should return false when comparing different encrypted values', () => {
      const password1 = EncryptedPasswordMother.random();
      const password2 = EncryptedPasswordMother.random();

      expect(password1.equals(password2)).toBe(false);
    });

    it('should return false when comparing with null', () => {
      const password = EncryptedPasswordMother.random();

      expect(password.equals(null as any)).toBe(false);
    });
  });

  describe('immutability', () => {
    it('should not allow modification of encrypted value', () => {
      const encryptedPassword = EncryptedPasswordMother.validEncrypted();
      const originalValue = encryptedPassword.value;

      expect(() => {
        (encryptedPassword as any).value = 'new-encrypted-value';
      }).toThrow();

      expect(encryptedPassword.value).toBe(originalValue);
    });
  });
});
