import { MasterPasswordHashingService } from '../../../../../src/Contexts/Authentication/Users/domain/MasterPasswordHashingService';
import { MasterPasswordMother } from '../../../../mothers/MasterPasswordMother';

describe('MasterPasswordHashingService', () => {
  let service: MasterPasswordHashingService;

  beforeEach(() => {
    service = new MasterPasswordHashingService();
  });

  describe('hash', () => {
    it('should generate a hash for a valid password', async () => {
      const password = MasterPasswordMother.random();

      const hash = await service.hash(password);

      expect(hash).toBeDefined();
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should generate different hashes for the same password', async () => {
      const password = MasterPasswordMother.random();

      const hash1 = await service.hash(password);
      const hash2 = await service.hash(password);

      expect(hash1).not.toBe(hash2);
    });

    it('should generate bcrypt hash', async () => {
      const password = MasterPasswordMother.random();

      const hash = await service.hash(password);

      expect(hash).toMatch(/^\$2[ayb]\$.{56}$/);
    });
  });

  describe('verify', () => {
    it('should return true when password matches hash', async () => {
      const password = MasterPasswordMother.random();
      const hash = await service.hash(password);

      const isValid = await service.verify(password, hash);

      expect(isValid).toBe(true);
    });

    it('should return false when password does not match hash', async () => {
      const password = MasterPasswordMother.random();
      const wrongPassword = MasterPasswordMother.random();
      const hash = await service.hash(password);

      const isValid = await service.verify(wrongPassword, hash);

      expect(isValid).toBe(false);
    });
  });

  describe('generateSalt', () => {
    it('should generate a salt', async () => {
      const salt = await service.generateSalt();

      expect(salt).toBeDefined();
      expect(salt.length).toBeGreaterThan(0);
    });

    it('should generate different salts on consecutive calls', async () => {
      const salt1 = await service.generateSalt();
      const salt2 = await service.generateSalt();

      expect(salt1).not.toBe(salt2);
    });

    it('should generate bcrypt salt', async () => {
      const salt = await service.generateSalt();

      expect(salt).toMatch(/^\$2[ayb]\$\d{2}\$.{22}$/);
    });
  });

  describe('validatePasswordComplexity', () => {
    it('should accept password with all requirements', () => {
      const password = MasterPasswordMother.strong();

      expect(() => service.validatePasswordComplexity(password)).not.toThrow();
    });

    it('should throw error when password is too short', () => {
      const password = MasterPasswordMother.invalidTooShort();

      expect(() => service.validatePasswordComplexity(password)).toThrow(
        'Master Password must be at least 12 characters long'
      );
    });

    it('should throw error when password has no uppercase letter', () => {
      const password = MasterPasswordMother.invalidNoUppercase();

      expect(() => service.validatePasswordComplexity(password)).toThrow(
        'Master Password must contain at least one uppercase letter'
      );
    });

    it('should throw error when password has no lowercase letter', () => {
      const password = MasterPasswordMother.invalidNoLowercase();

      expect(() => service.validatePasswordComplexity(password)).toThrow(
        'Master Password must contain at least one lowercase letter'
      );
    });

    it('should throw error when password has no number', () => {
      const password = MasterPasswordMother.invalidNoNumber();

      expect(() => service.validatePasswordComplexity(password)).toThrow(
        'Master Password must contain at least one number'
      );
    });

    it('should throw error when password has no special character', () => {
      const password = MasterPasswordMother.invalidNoSpecialChar();

      expect(() => service.validatePasswordComplexity(password)).toThrow(
        'Master Password must contain at least one special character'
      );
    });

    it('should throw error when password is empty', () => {
      const password = MasterPasswordMother.invalidEmpty();

      expect(() => service.validatePasswordComplexity(password)).toThrow(
        'Master Password must be at least 12 characters long'
      );
    });
  });
});
