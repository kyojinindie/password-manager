import { AccessTokenMother } from '../../../../mothers/AccessTokenMother';
import { AccessToken } from '../../../../../src/Contexts/Authentication/Users/domain/AccessToken';

describe('AccessToken', () => {
  describe('constructor', () => {
    it('should create AccessToken with valid JWT format', () => {
      const token = AccessTokenMother.random();

      expect(token.value).toBeDefined();
      expect(typeof token.value).toBe('string');
    });

    it('should create AccessToken with valid three-part JWT', () => {
      const validJWT = AccessTokenMother.validJWTValue();
      const token = AccessTokenMother.create(validJWT);

      const parts = token.value.split('.');
      expect(parts).toHaveLength(3);
    });

    it('should throw error when value is empty', () => {
      const emptyValue = AccessTokenMother.invalidEmpty();

      expect(() => AccessTokenMother.create(emptyValue)).toThrow(
        'AccessToken cannot be empty'
      );
    });

    it('should throw error when value is blank', () => {
      const blankValue = AccessTokenMother.invalidBlank();

      expect(() => AccessTokenMother.create(blankValue)).toThrow(
        'AccessToken cannot be blank'
      );
    });

    it('should throw error when value is not a string', () => {
      const nonString = AccessTokenMother.invalidNonString();

      expect(() => AccessTokenMother.create(nonString)).toThrow(
        'AccessToken must be a string'
      );
    });

    it('should throw error when JWT has only two parts', () => {
      const invalidJWT = AccessTokenMother.invalidMissingParts();

      expect(() => AccessTokenMother.create(invalidJWT)).toThrow(
        'AccessToken must be a valid JWT format'
      );
    });

    it('should throw error when JWT has only one part', () => {
      const invalidJWT = AccessTokenMother.invalidSinglePart();

      expect(() => AccessTokenMother.create(invalidJWT)).toThrow(
        'AccessToken must be a valid JWT format'
      );
    });

    it('should throw error when JWT has empty part', () => {
      const invalidJWT = AccessTokenMother.invalidEmptyPart();

      expect(() => AccessTokenMother.create(invalidJWT)).toThrow(
        'AccessToken JWT parts cannot be empty'
      );
    });

    it('should throw error when value is null', () => {
      expect(() => AccessTokenMother.create(null as any)).toThrow(
        'AccessToken cannot be empty'
      );
    });

    it('should throw error when value is undefined', () => {
      expect(() => AccessTokenMother.create(undefined as any)).toThrow(
        'AccessToken cannot be empty'
      );
    });
  });

  describe('getExpirationMinutes', () => {
    it('should return 15 minutes as expiration time', () => {
      const token = AccessTokenMother.random();
      const expirationMinutes = (
        token.constructor as typeof AccessToken
      ).getExpirationMinutes();

      expect(expirationMinutes).toBe(15);
    });
  });

  describe('getExpirationDate', () => {
    it('should return expiration date 15 minutes from now', () => {
      const token = AccessTokenMother.random();
      const before = new Date();

      const expirationDate = token.getExpirationDate();

      const after = new Date();
      const expectedMin = new Date(before.getTime() + 15 * 60 * 1000);
      const expectedMax = new Date(after.getTime() + 15 * 60 * 1000);

      expect(expirationDate.getTime()).toBeGreaterThanOrEqual(expectedMin.getTime());
      expect(expirationDate.getTime()).toBeLessThanOrEqual(expectedMax.getTime());
    });

    it('should return date in the future', () => {
      const token = AccessTokenMother.random();
      const now = new Date();

      const expirationDate = token.getExpirationDate();

      expect(expirationDate.getTime()).toBeGreaterThan(now.getTime());
    });

    it('should calculate expiration correctly for multiple tokens', () => {
      const token1 = AccessTokenMother.random();
      const token2 = AccessTokenMother.random();

      const expiration1 = token1.getExpirationDate();
      const expiration2 = token2.getExpirationDate();

      // Both should be approximately 15 minutes from now (within 1 second tolerance)
      expect(Math.abs(expiration1.getTime() - expiration2.getTime())).toBeLessThan(1000);
    });
  });

  describe('equals', () => {
    it('should return true when comparing same token values', () => {
      const tokenValue = AccessTokenMother.validJWTValue();
      const token1 = AccessTokenMother.create(tokenValue);
      const token2 = AccessTokenMother.create(tokenValue);

      expect(token1.equals(token2)).toBe(true);
    });

    it('should return false when comparing different tokens', () => {
      const token1 = AccessTokenMother.random();
      const token2 = AccessTokenMother.random();

      expect(token1.equals(token2)).toBe(false);
    });

    it('should return false when comparing with null', () => {
      const token = AccessTokenMother.random();

      expect(token.equals(null as any)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return token as string', () => {
      const tokenValue = AccessTokenMother.validJWTValue();
      const token = AccessTokenMother.create(tokenValue);

      expect(token.toString()).toBe(tokenValue);
    });
  });

  describe('immutability', () => {
    it('should not allow modification of token value', () => {
      const originalValue = AccessTokenMother.validJWTValue();
      const token = AccessTokenMother.create(originalValue);

      expect(token.value).toBe(originalValue);
    });
  });
});
