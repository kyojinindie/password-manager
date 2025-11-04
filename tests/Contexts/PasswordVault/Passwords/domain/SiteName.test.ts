import { SiteNameMother } from '../../../../mothers/SiteNameMother';
import { InvalidSiteNameException } from '../../../../../src/Contexts/PasswordVault/Passwords/domain/InvalidSiteNameException';

describe('SiteName', () => {
  describe('constructor', () => {
    it('should create SiteName with valid value', () => {
      const siteName = SiteNameMother.google();

      expect(siteName.value).toBe('Google');
    });

    it('should create SiteName with random value', () => {
      const siteName = SiteNameMother.random();

      expect(siteName.value).toBeDefined();
      expect(typeof siteName.value).toBe('string');
      expect(siteName.value.length).toBeGreaterThan(0);
    });

    it('should trim whitespace from value', () => {
      const siteName = SiteNameMother.withSpaces();

      expect(siteName.value).toBe('My Site Name');
      expect(siteName.value).not.toContain('  ');
    });

    it('should throw error when value is empty', () => {
      const emptyValue = SiteNameMother.invalidEmpty();

      expect(() => SiteNameMother.create(emptyValue)).toThrow(InvalidSiteNameException);
      expect(() => SiteNameMother.create(emptyValue)).toThrow(
        'Site name cannot be empty'
      );
    });

    it('should throw error when value is blank', () => {
      const blankValue = SiteNameMother.invalidBlank();

      expect(() => SiteNameMother.create(blankValue)).toThrow(InvalidSiteNameException);
      expect(() => SiteNameMother.create(blankValue)).toThrow(
        'Site name cannot be empty'
      );
    });

    it('should throw error when value exceeds max length', () => {
      const tooLongValue = SiteNameMother.invalidTooLong();

      expect(() => SiteNameMother.create(tooLongValue)).toThrow(InvalidSiteNameException);
      expect(() => SiteNameMother.create(tooLongValue)).toThrow(
        'Site name cannot exceed 100 characters'
      );
    });

    it('should accept value at max length', () => {
      const maxLengthSiteName = SiteNameMother.maxLength();

      expect(maxLengthSiteName.value).toHaveLength(100);
    });

    it('should throw error when value is null', () => {
      const nullValue = SiteNameMother.invalidNull();

      expect(() => SiteNameMother.create(nullValue)).toThrow(InvalidSiteNameException);
    });

    it('should throw error when value is undefined', () => {
      const undefinedValue = SiteNameMother.invalidUndefined();

      expect(() => SiteNameMother.create(undefinedValue)).toThrow(
        InvalidSiteNameException
      );
    });
  });

  describe('equals', () => {
    it('should return true when comparing same values', () => {
      const name1 = SiteNameMother.google();
      const name2 = SiteNameMother.google();

      expect(name1.equals(name2)).toBe(true);
    });

    it('should return false when comparing different values', () => {
      const name1 = SiteNameMother.google();
      const name2 = SiteNameMother.facebook();

      expect(name1.equals(name2)).toBe(false);
    });

    it('should return false when comparing with null', () => {
      const name = SiteNameMother.google();

      expect(name.equals(null as any)).toBe(false);
    });

    it('should be case-sensitive', () => {
      const name1 = SiteNameMother.create('Google');
      const name2 = SiteNameMother.create('google');

      expect(name1.equals(name2)).toBe(false);
    });
  });

  describe('immutability', () => {
    it('should not allow modification of value', () => {
      const siteName = SiteNameMother.google();
      const originalValue = siteName.value;

      expect(() => {
        (siteName as any).value = 'New Value';
      }).toThrow();

      expect(siteName.value).toBe(originalValue);
    });
  });
});
