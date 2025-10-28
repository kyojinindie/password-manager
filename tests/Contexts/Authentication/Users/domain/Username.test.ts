import { UsernameMother } from '../../../../mothers/UsernameMother';

describe('Username', () => {
  describe('constructor', () => {
    it('should create a Username with valid value', () => {
      const username = UsernameMother.random();

      expect(username.value).toBeDefined();
      expect(username.value.length).toBeGreaterThanOrEqual(3);
    });

    it('should trim whitespace', () => {
      const result = UsernameMother.withWhitespace();

      expect(result.username.value).toBe(result.original);
    });

    it('should throw error when value is empty', () => {
      const invalidUsername = UsernameMother.invalidEmpty();

      expect(() => UsernameMother.create(invalidUsername)).toThrow(
        'Username cannot be empty'
      );
    });

    it('should throw error when value is too short', () => {
      const invalidUsername = UsernameMother.invalidTooShort();

      expect(() => UsernameMother.create(invalidUsername)).toThrow(
        'Username must be between 3 and 50 characters'
      );
    });

    it('should throw error when value is too long', () => {
      const invalidUsername = UsernameMother.invalidTooLong();

      expect(() => UsernameMother.create(invalidUsername)).toThrow(
        'Username must be between 3 and 50 characters'
      );
    });

    it('should throw error when value is null', () => {
      expect(() => UsernameMother.create(null as any)).toThrow(
        'Username cannot be empty'
      );
    });

    it('should throw error when value is undefined', () => {
      expect(() => UsernameMother.create(undefined as any)).toThrow(
        'Username cannot be empty'
      );
    });

    it('should accept username with minimum length', () => {
      const username = UsernameMother.withLength(3);

      expect(username.value.length).toBe(3);
    });

    it('should accept username with maximum length', () => {
      const username = UsernameMother.withLength(50);

      expect(username.value.length).toBe(50);
    });
  });

  describe('equals', () => {
    it('should return true when comparing same username values', () => {
      const usernameValue = UsernameMother.randomValue();
      const username1 = UsernameMother.create(usernameValue);
      const username2 = UsernameMother.create(usernameValue);

      expect(username1.equals(username2)).toBe(true);
    });

    it('should return false when comparing different usernames', () => {
      const username1 = UsernameMother.random();
      const username2 = UsernameMother.random();

      expect(username1.equals(username2)).toBe(false);
    });

    it('should return false when comparing with null', () => {
      const username = UsernameMother.random();

      expect(username.equals(null as any)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return username as string', () => {
      const usernameValue = UsernameMother.randomValue();
      const username = UsernameMother.create(usernameValue);

      expect(username.toString()).toBe(usernameValue);
    });
  });
});
