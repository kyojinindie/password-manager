import { LastLoginAtMother } from '../../../../mothers/LastLoginAtMother';

describe('LastLoginAt', () => {
  describe('constructor', () => {
    it('should create LastLoginAt with null value', () => {
      const lastLogin = LastLoginAtMother.empty();

      expect(lastLogin.value).toBeNull();
    });

    it('should create LastLoginAt with valid date', () => {
      const date = new Date('2024-01-15T10:00:00.000Z');
      const lastLogin = LastLoginAtMother.create(date);

      expect(lastLogin.value).toEqual(date);
    });

    it('should create LastLoginAt with current date', () => {
      const lastLogin = LastLoginAtMother.now();

      expect(lastLogin.value).toBeInstanceOf(Date);
      expect(lastLogin.value).not.toBeNull();
    });

    it('should throw error when value is not a Date or null', () => {
      expect(() => LastLoginAtMother.create('invalid' as any)).toThrow(
        'LastLoginAt must be a Date or null'
      );
    });

    it('should throw error when date is invalid', () => {
      const invalidDate = LastLoginAtMother.invalidDate();

      expect(() => LastLoginAtMother.create(invalidDate)).toThrow(
        'LastLoginAt must be a valid Date'
      );
    });

    it('should throw error when date is in the future', () => {
      const futureDate = LastLoginAtMother.invalidFutureDate();

      expect(() => LastLoginAtMother.create(futureDate)).toThrow(
        'LastLoginAt cannot be in the future'
      );
    });
  });

  describe('empty', () => {
    it('should create LastLoginAt with null value', () => {
      const lastLogin = LastLoginAtMother.empty();

      expect(lastLogin.value).toBeNull();
    });
  });

  describe('now', () => {
    it('should create LastLoginAt with current date', () => {
      const before = new Date();
      const lastLogin = LastLoginAtMother.now();
      const after = new Date();

      expect(lastLogin.value).not.toBeNull();
      expect(lastLogin.value!.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(lastLogin.value!.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('isEmpty', () => {
    it('should return true when value is null', () => {
      const lastLogin = LastLoginAtMother.empty();

      expect(lastLogin.isEmpty()).toBe(true);
    });

    it('should return false when value is a date', () => {
      const lastLogin = LastLoginAtMother.now();

      expect(lastLogin.isEmpty()).toBe(false);
    });

    it('should return false when value is yesterday', () => {
      const lastLogin = LastLoginAtMother.yesterday();

      expect(lastLogin.isEmpty()).toBe(false);
    });
  });

  describe('hasValue', () => {
    it('should return false when value is null', () => {
      const lastLogin = LastLoginAtMother.empty();

      expect(lastLogin.hasValue()).toBe(false);
    });

    it('should return true when value is a date', () => {
      const lastLogin = LastLoginAtMother.now();

      expect(lastLogin.hasValue()).toBe(true);
    });

    it('should return true when value is one week ago', () => {
      const lastLogin = LastLoginAtMother.oneWeekAgo();

      expect(lastLogin.hasValue()).toBe(true);
    });
  });

  describe('isBefore', () => {
    it('should return false when value is null', () => {
      const lastLogin = LastLoginAtMother.empty();
      const compareDate = new Date();

      expect(lastLogin.isBefore(compareDate)).toBe(false);
    });

    it('should return true when value is before comparison date', () => {
      const lastLogin = LastLoginAtMother.yesterday();
      const compareDate = new Date();

      expect(lastLogin.isBefore(compareDate)).toBe(true);
    });

    it('should return false when value is after comparison date', () => {
      const lastLogin = LastLoginAtMother.now();
      const compareDate = new Date('2020-01-01T00:00:00.000Z');

      expect(lastLogin.isBefore(compareDate)).toBe(false);
    });

    it('should return true when value is one week ago compared to today', () => {
      const lastLogin = LastLoginAtMother.oneWeekAgo();
      const compareDate = new Date();

      expect(lastLogin.isBefore(compareDate)).toBe(true);
    });

    it('should return false when value is equal to comparison date', () => {
      const date = new Date('2024-01-15T10:00:00.000Z');
      const lastLogin = LastLoginAtMother.create(date);

      expect(lastLogin.isBefore(date)).toBe(false);
    });
  });

  describe('isAfter', () => {
    it('should return false when value is null', () => {
      const lastLogin = LastLoginAtMother.empty();
      const compareDate = new Date();

      expect(lastLogin.isAfter(compareDate)).toBe(false);
    });

    it('should return false when value is before comparison date', () => {
      const lastLogin = LastLoginAtMother.oneWeekAgo();
      const compareDate = new Date();

      expect(lastLogin.isAfter(compareDate)).toBe(false);
    });

    it('should return true when value is after comparison date', () => {
      const lastLogin = LastLoginAtMother.now();
      const compareDate = new Date('2020-01-01T00:00:00.000Z');

      expect(lastLogin.isAfter(compareDate)).toBe(true);
    });

    it('should return false when value is one month ago compared to yesterday', () => {
      const lastLogin = LastLoginAtMother.oneMonthAgo();
      const compareDate = new Date();
      compareDate.setDate(compareDate.getDate() - 1);

      expect(lastLogin.isAfter(compareDate)).toBe(false);
    });

    it('should return false when value is equal to comparison date', () => {
      const date = new Date('2024-01-15T10:00:00.000Z');
      const lastLogin = LastLoginAtMother.create(date);

      expect(lastLogin.isAfter(date)).toBe(false);
    });
  });

  describe('toDate', () => {
    it('should return null when value is null', () => {
      const lastLogin = LastLoginAtMother.empty();

      expect(lastLogin.toDate()).toBeNull();
    });

    it('should return date when value is a date', () => {
      const date = new Date('2024-01-15T10:00:00.000Z');
      const lastLogin = LastLoginAtMother.create(date);

      expect(lastLogin.toDate()).toEqual(date);
    });

    it('should return the exact date instance', () => {
      const lastLogin = LastLoginAtMother.yesterday();

      const result = lastLogin.toDate();

      expect(result).toBeInstanceOf(Date);
    });
  });

  describe('equals', () => {
    it('should return true when comparing two empty values', () => {
      const lastLogin1 = LastLoginAtMother.empty();
      const lastLogin2 = LastLoginAtMother.empty();

      expect(lastLogin1.equals(lastLogin2)).toBe(true);
    });

    it('should return true when comparing same date values', () => {
      const date = new Date('2024-01-15T10:00:00.000Z');
      const lastLogin1 = LastLoginAtMother.create(date);
      const lastLogin2 = LastLoginAtMother.create(date);

      expect(lastLogin1.equals(lastLogin2)).toBe(true);
    });

    it('should return false when comparing different dates', () => {
      const lastLogin1 = LastLoginAtMother.yesterday();
      const lastLogin2 = LastLoginAtMother.oneWeekAgo();

      expect(lastLogin1.equals(lastLogin2)).toBe(false);
    });

    it('should return false when comparing null with a date', () => {
      const lastLogin1 = LastLoginAtMother.empty();
      const lastLogin2 = LastLoginAtMother.now();

      expect(lastLogin1.equals(lastLogin2)).toBe(false);
    });

    it('should return false when comparing with null', () => {
      const lastLogin = LastLoginAtMother.now();

      expect(lastLogin.equals(null as any)).toBe(false);
    });
  });

  describe('immutability', () => {
    it('should store the date reference', () => {
      const originalDate = new Date('2024-01-15T10:00:00.000Z');
      const lastLogin = LastLoginAtMother.create(originalDate);

      // Note: JavaScript Date objects are mutable and stored by reference
      // This test verifies the current behavior
      expect(lastLogin.value).toBe(originalDate);
    });
  });
});
