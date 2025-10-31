import { RefreshTokenMother } from '../../../../mothers/RefreshTokenMother';
import { RefreshToken } from '../../../../../src/Contexts/Authentication/Users/domain/RefreshToken';

describe('RefreshToken', () => {
  describe('constructor', () => {
    it('should create RefreshToken with valid JWT format', () => {
      const token = RefreshTokenMother.random();

      expect(token.value).toBeDefined();
      expect(typeof token.value).toBe('string');
    });

    it('should create RefreshToken with valid three-part JWT', () => {
      const validJWT = RefreshTokenMother.validJWTValue();
      const token = RefreshTokenMother.create(validJWT);

      const parts = token.value.split('.');
      expect(parts).toHaveLength(3);
    });

    it('should throw error when value is empty', () => {
      const emptyValue = RefreshTokenMother.invalidEmpty();

      expect(() => RefreshTokenMother.create(emptyValue)).toThrow(
        'RefreshToken cannot be empty'
      );
    });

    it('should throw error when value is blank', () => {
      const blankValue = RefreshTokenMother.invalidBlank();

      expect(() => RefreshTokenMother.create(blankValue)).toThrow(
        'RefreshToken cannot be blank'
      );
    });

    it('should throw error when value is not a string', () => {
      const nonString = RefreshTokenMother.invalidNonString();

      expect(() => RefreshTokenMother.create(nonString)).toThrow(
        'RefreshToken must be a string'
      );
    });

    it('should throw error when JWT has only two parts', () => {
      const invalidJWT = RefreshTokenMother.invalidMissingParts();

      expect(() => RefreshTokenMother.create(invalidJWT)).toThrow(
        'RefreshToken must be a valid JWT format'
      );
    });

    it('should throw error when JWT has only one part', () => {
      const invalidJWT = RefreshTokenMother.invalidSinglePart();

      expect(() => RefreshTokenMother.create(invalidJWT)).toThrow(
        'RefreshToken must be a valid JWT format'
      );
    });

    it('should throw error when JWT has empty part', () => {
      const invalidJWT = RefreshTokenMother.invalidEmptyPart();

      expect(() => RefreshTokenMother.create(invalidJWT)).toThrow(
        'RefreshToken JWT parts cannot be empty'
      );
    });

    it('should throw error when value is null', () => {
      expect(() => RefreshTokenMother.create(null as any)).toThrow(
        'RefreshToken cannot be empty'
      );
    });

    it('should throw error when value is undefined', () => {
      expect(() => RefreshTokenMother.create(undefined as any)).toThrow(
        'RefreshToken cannot be empty'
      );
    });
  });

  describe('getExpirationDays', () => {
    it('should return 7 days as expiration time', () => {
      const token = RefreshTokenMother.random();
      const expirationDays = (
        token.constructor as typeof RefreshToken
      ).getExpirationDays();

      expect(expirationDays).toBe(7);
    });
  });

  describe('getExpirationDate', () => {
    it('should return expiration date 7 days from now', () => {
      const token = RefreshTokenMother.random();
      const before = new Date();

      const expirationDate = token.getExpirationDate();

      const after = new Date();
      const expectedMin = new Date(before.getTime() + 7 * 24 * 60 * 60 * 1000);
      const expectedMax = new Date(after.getTime() + 7 * 24 * 60 * 60 * 1000);

      expect(expirationDate.getTime()).toBeGreaterThanOrEqual(expectedMin.getTime());
      expect(expirationDate.getTime()).toBeLessThanOrEqual(expectedMax.getTime());
    });

    it('should return date in the future', () => {
      const token = RefreshTokenMother.random();
      const now = new Date();

      const expirationDate = token.getExpirationDate();

      expect(expirationDate.getTime()).toBeGreaterThan(now.getTime());
    });

    it('should calculate expiration correctly for multiple tokens', () => {
      const token1 = RefreshTokenMother.random();
      const token2 = RefreshTokenMother.random();

      const expiration1 = token1.getExpirationDate();
      const expiration2 = token2.getExpirationDate();

      // Both should be approximately 7 days from now (within 1 second tolerance)
      expect(Math.abs(expiration1.getTime() - expiration2.getTime())).toBeLessThan(1000);
    });
  });

  describe('equals', () => {
    it('should return true when comparing same token values', () => {
      const tokenValue = RefreshTokenMother.validJWTValue();
      const token1 = RefreshTokenMother.create(tokenValue);
      const token2 = RefreshTokenMother.create(tokenValue);

      expect(token1.equals(token2)).toBe(true);
    });

    it('should return false when comparing different tokens', () => {
      const token1 = RefreshTokenMother.random();
      const token2 = RefreshTokenMother.random();

      expect(token1.equals(token2)).toBe(false);
    });

    it('should return false when comparing with null', () => {
      const token = RefreshTokenMother.random();

      expect(token.equals(null as any)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return token as string', () => {
      const tokenValue = RefreshTokenMother.validJWTValue();
      const token = RefreshTokenMother.create(tokenValue);

      expect(token.toString()).toBe(tokenValue);
    });
  });

  describe('immutability', () => {
    it('should not allow modification of token value', () => {
      const originalValue = RefreshTokenMother.validJWTValue();
      const token = RefreshTokenMother.create(originalValue);

      expect(token.value).toBe(originalValue);
    });
  });
});
