import { SaltMother } from '../../../../mothers/SaltMother';

describe('Salt', () => {
  describe('constructor', () => {
    it('should create a Salt with valid value', () => {
      const salt = SaltMother.random();

      expect(salt.value).toBeDefined();
      expect(salt.value.length).toBeGreaterThan(0);
    });

    it('should throw error when value is empty', () => {
      const invalidSalt = SaltMother.invalidEmpty();

      expect(() => SaltMother.create(invalidSalt)).toThrow('Salt cannot be empty');
    });

    it('should throw error when value is null', () => {
      expect(() => SaltMother.create(null as any)).toThrow('Salt cannot be empty');
    });

    it('should throw error when value is undefined', () => {
      expect(() => SaltMother.create(undefined as any)).toThrow('Salt cannot be empty');
    });
  });

  describe('equals', () => {
    it('should return true when comparing same salt values', () => {
      const saltValue = SaltMother.randomValue();
      const salt1 = SaltMother.create(saltValue);
      const salt2 = SaltMother.create(saltValue);

      expect(salt1.equals(salt2)).toBe(true);
    });

    it('should return false when comparing different salt values', () => {
      const salt1 = SaltMother.random();
      const salt2 = SaltMother.random();

      expect(salt1.equals(salt2)).toBe(false);
    });

    it('should return false when comparing with null', () => {
      const salt = SaltMother.random();

      expect(salt.equals(null as any)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return salt as string', () => {
      const saltValue = SaltMother.randomValue();
      const salt = SaltMother.create(saltValue);

      expect(salt.toString()).toBe(saltValue);
    });
  });
});
