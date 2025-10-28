import { MasterPasswordHashMother } from '../../../../mothers/MasterPasswordHashMother';

describe('MasterPasswordHash', () => {
  describe('constructor', () => {
    it('should create a MasterPasswordHash with valid value', () => {
      const hash = MasterPasswordHashMother.random();

      expect(hash.value).toBeDefined();
      expect(hash.value.length).toBeGreaterThan(0);
    });

    it('should throw error when value is empty', () => {
      const invalidHash = MasterPasswordHashMother.invalidEmpty();

      expect(() => MasterPasswordHashMother.create(invalidHash)).toThrow(
        'MasterPasswordHash cannot be empty'
      );
    });

    it('should throw error when value is null', () => {
      expect(() => MasterPasswordHashMother.create(null as any)).toThrow(
        'MasterPasswordHash cannot be empty'
      );
    });

    it('should throw error when value is undefined', () => {
      expect(() => MasterPasswordHashMother.create(undefined as any)).toThrow(
        'MasterPasswordHash cannot be empty'
      );
    });
  });

  describe('equals', () => {
    it('should return true when comparing same hash values', () => {
      const hashValue = MasterPasswordHashMother.randomValue();
      const hash1 = MasterPasswordHashMother.create(hashValue);
      const hash2 = MasterPasswordHashMother.create(hashValue);

      expect(hash1.equals(hash2)).toBe(true);
    });

    it('should return false when comparing different hash values', () => {
      const hash1 = MasterPasswordHashMother.random();
      const hash2 = MasterPasswordHashMother.random();

      expect(hash1.equals(hash2)).toBe(false);
    });

    it('should return false when comparing with null', () => {
      const hash = MasterPasswordHashMother.random();

      expect(hash.equals(null as any)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return hash as string', () => {
      const hashValue = MasterPasswordHashMother.randomValue();
      const hash = MasterPasswordHashMother.create(hashValue);

      expect(hash.toString()).toBe(hashValue);
    });
  });
});
