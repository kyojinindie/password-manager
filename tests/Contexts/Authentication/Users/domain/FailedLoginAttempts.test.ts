import { FailedLoginAttemptsMother } from '../../../../mothers/FailedLoginAttemptsMother';

describe('FailedLoginAttempts', () => {
  describe('constructor', () => {
    it('should create FailedLoginAttempts with zero value', () => {
      const attempts = FailedLoginAttemptsMother.zero();

      expect(attempts.value).toBe(0);
    });

    it('should create FailedLoginAttempts with valid value', () => {
      const attempts = FailedLoginAttemptsMother.create(3);

      expect(attempts.value).toBe(3);
    });

    it('should create FailedLoginAttempts with maximum value', () => {
      const attempts = FailedLoginAttemptsMother.atLockThreshold();

      expect(attempts.value).toBe(5);
    });

    it('should throw error when value is negative', () => {
      const invalidValue = FailedLoginAttemptsMother.invalidNegative();

      expect(() => FailedLoginAttemptsMother.create(invalidValue)).toThrow(
        'FailedLoginAttempts cannot be negative (minimum: 0)'
      );
    });

    it('should throw error when value exceeds maximum', () => {
      const invalidValue = FailedLoginAttemptsMother.invalidExceedsMax();

      expect(() => FailedLoginAttemptsMother.create(invalidValue)).toThrow(
        'FailedLoginAttempts cannot exceed 5'
      );
    });

    it('should throw error when value is not an integer', () => {
      const invalidValue = FailedLoginAttemptsMother.invalidNonInteger();

      expect(() => FailedLoginAttemptsMother.create(invalidValue)).toThrow(
        'FailedLoginAttempts must be an integer'
      );
    });

    it('should throw error when value is null', () => {
      expect(() => FailedLoginAttemptsMother.create(null as any)).toThrow(
        'FailedLoginAttempts cannot be null or undefined'
      );
    });

    it('should throw error when value is undefined', () => {
      expect(() => FailedLoginAttemptsMother.create(undefined as any)).toThrow(
        'FailedLoginAttempts cannot be null or undefined'
      );
    });
  });

  describe('zero', () => {
    it('should create FailedLoginAttempts with zero value', () => {
      const attempts = FailedLoginAttemptsMother.zero();

      expect(attempts.value).toBe(0);
    });
  });

  describe('increment', () => {
    it('should increment value by one when below maximum', () => {
      const attempts = FailedLoginAttemptsMother.zero();

      const incremented = attempts.increment();

      expect(incremented.value).toBe(1);
    });

    it('should not mutate original instance when incrementing', () => {
      const attempts = FailedLoginAttemptsMother.zero();

      attempts.increment();

      expect(attempts.value).toBe(0);
    });

    it('should not exceed maximum value when incrementing at threshold', () => {
      const attempts = FailedLoginAttemptsMother.atLockThreshold();

      const incremented = attempts.increment();

      expect(incremented.value).toBe(5);
    });

    it('should increment from one to two', () => {
      const attempts = FailedLoginAttemptsMother.one();

      const incremented = attempts.increment();

      expect(incremented.value).toBe(2);
    });

    it('should increment from four to five', () => {
      const attempts = FailedLoginAttemptsMother.four();

      const incremented = attempts.increment();

      expect(incremented.value).toBe(5);
    });
  });

  describe('reset', () => {
    it('should reset to zero from any value', () => {
      const attempts = FailedLoginAttemptsMother.four();

      const reset = attempts.reset();

      expect(reset.value).toBe(0);
    });

    it('should reset to zero from locked state', () => {
      const attempts = FailedLoginAttemptsMother.locked();

      const reset = attempts.reset();

      expect(reset.value).toBe(0);
    });

    it('should not mutate original instance when resetting', () => {
      const attempts = FailedLoginAttemptsMother.four();

      attempts.reset();

      expect(attempts.value).toBe(4);
    });

    it('should reset to zero when already at zero', () => {
      const attempts = FailedLoginAttemptsMother.zero();

      const reset = attempts.reset();

      expect(reset.value).toBe(0);
    });
  });

  describe('isAccountLocked', () => {
    it('should return false when attempts is zero', () => {
      const attempts = FailedLoginAttemptsMother.zero();

      expect(attempts.isAccountLocked()).toBe(false);
    });

    it('should return false when attempts is below threshold', () => {
      const attempts = FailedLoginAttemptsMother.four();

      expect(attempts.isAccountLocked()).toBe(false);
    });

    it('should return true when attempts equals threshold', () => {
      const attempts = FailedLoginAttemptsMother.atLockThreshold();

      expect(attempts.isAccountLocked()).toBe(true);
    });

    it('should return true when at maximum attempts', () => {
      const attempts = FailedLoginAttemptsMother.locked();

      expect(attempts.isAccountLocked()).toBe(true);
    });

    it('should return false when attempts is one', () => {
      const attempts = FailedLoginAttemptsMother.one();

      expect(attempts.isAccountLocked()).toBe(false);
    });

    it('should return false when attempts is three', () => {
      const attempts = FailedLoginAttemptsMother.three();

      expect(attempts.isAccountLocked()).toBe(false);
    });
  });

  describe('isZero', () => {
    it('should return true when value is zero', () => {
      const attempts = FailedLoginAttemptsMother.zero();

      expect(attempts.isZero()).toBe(true);
    });

    it('should return false when value is not zero', () => {
      const attempts = FailedLoginAttemptsMother.one();

      expect(attempts.isZero()).toBe(false);
    });

    it('should return false when value is at threshold', () => {
      const attempts = FailedLoginAttemptsMother.atLockThreshold();

      expect(attempts.isZero()).toBe(false);
    });
  });

  describe('equals', () => {
    it('should return true when comparing same values', () => {
      const attempts1 = FailedLoginAttemptsMother.create(3);
      const attempts2 = FailedLoginAttemptsMother.create(3);

      expect(attempts1.equals(attempts2)).toBe(true);
    });

    it('should return false when comparing different values', () => {
      const attempts1 = FailedLoginAttemptsMother.zero();
      const attempts2 = FailedLoginAttemptsMother.one();

      expect(attempts1.equals(attempts2)).toBe(false);
    });

    it('should return true when comparing two zero instances', () => {
      const attempts1 = FailedLoginAttemptsMother.zero();
      const attempts2 = FailedLoginAttemptsMother.zero();

      expect(attempts1.equals(attempts2)).toBe(true);
    });

    it('should return false when comparing with null', () => {
      const attempts = FailedLoginAttemptsMother.zero();

      expect(attempts.equals(null as any)).toBe(false);
    });
  });

  describe('immutability', () => {
    it('should return new instance when incrementing', () => {
      const attempts = FailedLoginAttemptsMother.zero();

      const incremented = attempts.increment();

      expect(incremented).not.toBe(attempts);
    });

    it('should return new instance when resetting', () => {
      const attempts = FailedLoginAttemptsMother.four();

      const reset = attempts.reset();

      expect(reset).not.toBe(attempts);
    });
  });
});
