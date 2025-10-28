import { UserIdMother } from '../../../../mothers/UserIdMother';

describe('UserId', () => {
  describe('constructor', () => {
    it('should create a UserId with a valid UUID', () => {
      const validUuid = UserIdMother.randomValue();

      const userId = UserIdMother.create(validUuid);

      expect(userId.value).toBe(validUuid);
    });

    it('should throw error when value is empty', () => {
      const invalidValue = UserIdMother.invalidEmpty();

      expect(() => UserIdMother.create(invalidValue)).toThrow(
        'UserId cannot be empty'
      );
    });

    it('should throw error when value is whitespace only', () => {
      const invalidValue = UserIdMother.invalidWhitespace();

      expect(() => UserIdMother.create(invalidValue)).toThrow(
        'UserId cannot be empty'
      );
    });

    it('should throw error when value is null', () => {
      expect(() => UserIdMother.create(null as any)).toThrow(
        'UserId cannot be empty'
      );
    });

    it('should throw error when value is undefined', () => {
      expect(() => UserIdMother.create(undefined as any)).toThrow(
        'UserId cannot be empty'
      );
    });
  });

  describe('generate', () => {
    it('should generate a valid UUID', () => {
      const userId = UserIdMother.random();

      expect(userId.value).toBeDefined();
      expect(userId.value).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    it('should generate different UUIDs on consecutive calls', () => {
      const userId1 = UserIdMother.random();
      const userId2 = UserIdMother.random();

      expect(userId1.value).not.toBe(userId2.value);
    });
  });

  describe('equals', () => {
    it('should return true when comparing same UserId values', () => {
      const uuid = UserIdMother.randomValue();
      const userId1 = UserIdMother.create(uuid);
      const userId2 = UserIdMother.create(uuid);

      expect(userId1.equals(userId2)).toBe(true);
    });

    it('should return false when comparing different UserId values', () => {
      const userId1 = UserIdMother.random();
      const userId2 = UserIdMother.random();

      expect(userId1.equals(userId2)).toBe(false);
    });

    it('should return false when comparing with null', () => {
      const userId = UserIdMother.random();

      expect(userId.equals(null as any)).toBe(false);
    });

    it('should return false when comparing with undefined', () => {
      const userId = UserIdMother.random();

      expect(userId.equals(undefined as any)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return the UUID as string', () => {
      const uuid = UserIdMother.randomValue();
      const userId = UserIdMother.create(uuid);

      expect(userId.toString()).toBe(uuid);
    });
  });
});
