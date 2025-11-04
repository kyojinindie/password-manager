import { PasswordUsernameMother } from '../../../../mothers/PasswordUsernameMothor';
import { InvalidUsernameException } from '../../../../../src/Contexts/PasswordVault/Passwords/domain/InvalidUsernameException';

describe('Username', () => {
  describe('constructor', () => {
    it('should create Username with valid value', () => {
      const username = PasswordUsernameMother.simple();

      expect(username.value).toBe('john_doe');
    });

    it('should create Username with email format', () => {
      const username = PasswordUsernameMother.email();

      expect(username.value).toBeDefined();
      expect(typeof username.value).toBe('string');
      expect(username.value.length).toBeGreaterThan(0);
    });

    it('should create Username with random value', () => {
      const username = PasswordUsernameMother.random();

      expect(username.value).toBeDefined();
      expect(typeof username.value).toBe('string');
    });

    it('should trim whitespace from value', () => {
      const username = PasswordUsernameMother.withSpaces();

      expect(username.value).toBe('user@example.com');
      expect(username.value).not.toMatch(/^\s+|\s+$/);
    });

    it('should throw error when value is empty', () => {
      const emptyValue = PasswordUsernameMother.invalidEmpty();

      expect(() => PasswordUsernameMother.create(emptyValue)).toThrow(
        InvalidUsernameException
      );
      expect(() => PasswordUsernameMother.create(emptyValue)).toThrow(
        'Username cannot be empty'
      );
    });

    it('should throw error when value is blank', () => {
      const blankValue = PasswordUsernameMother.invalidBlank();

      expect(() => PasswordUsernameMother.create(blankValue)).toThrow(
        InvalidUsernameException
      );
      expect(() => PasswordUsernameMother.create(blankValue)).toThrow(
        'Username cannot be empty'
      );
    });

    it('should throw error when value is null', () => {
      const nullValue = PasswordUsernameMother.invalidNull();

      expect(() => PasswordUsernameMother.create(nullValue)).toThrow(
        InvalidUsernameException
      );
    });

    it('should throw error when value is undefined', () => {
      const undefinedValue = PasswordUsernameMother.invalidUndefined();

      expect(() => PasswordUsernameMother.create(undefinedValue)).toThrow(
        InvalidUsernameException
      );
    });
  });

  describe('equals', () => {
    it('should return true when comparing same values', () => {
      const username1 = PasswordUsernameMother.simple();
      const username2 = PasswordUsernameMother.simple();

      expect(username1.equals(username2)).toBe(true);
    });

    it('should return false when comparing different values', () => {
      const username1 = PasswordUsernameMother.simple();
      const username2 = PasswordUsernameMother.email();

      expect(username1.equals(username2)).toBe(false);
    });

    it('should return false when comparing with null', () => {
      const username = PasswordUsernameMother.simple();

      expect(username.equals(null as any)).toBe(false);
    });
  });

  describe('immutability', () => {
    it('should not allow modification of value', () => {
      const username = PasswordUsernameMother.simple();
      const originalValue = username.value;

      expect(() => {
        (username as any).value = 'new-username';
      }).toThrow();

      expect(username.value).toBe(originalValue);
    });
  });
});
