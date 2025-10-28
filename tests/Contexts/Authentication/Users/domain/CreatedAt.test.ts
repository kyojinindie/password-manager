import { CreatedAtMother } from '../../../../mothers/CreatedAtMother';

describe('CreatedAt', () => {
  describe('constructor', () => {
    it('should create a CreatedAt with valid date', () => {
      const createdAt = CreatedAtMother.random();

      expect(createdAt.value).toBeDefined();
      expect(createdAt.value).toBeInstanceOf(Date);
    });

    it('should create CreatedAt with current date', () => {
      const createdAt = CreatedAtMother.now();
      const now = new Date();

      expect(createdAt.value.getTime()).toBeLessThanOrEqual(now.getTime());
    });

    it('should throw error when value is null', () => {
      expect(() => CreatedAtMother.create(null as any)).toThrow(
        'CreatedAt cannot be null or undefined'
      );
    });

    it('should throw error when value is undefined', () => {
      expect(() => CreatedAtMother.create(undefined as any)).toThrow(
        'CreatedAt cannot be null or undefined'
      );
    });
  });

  describe('equals', () => {
    it('should return true when comparing same date values', () => {
      const dateValue = CreatedAtMother.randomValue();
      const createdAt1 = CreatedAtMother.create(dateValue);
      const createdAt2 = CreatedAtMother.create(dateValue);

      expect(createdAt1.equals(createdAt2)).toBe(true);
    });

    it('should return false when comparing different dates', () => {
      const createdAt1 = CreatedAtMother.random();
      const createdAt2 = CreatedAtMother.random();

      expect(createdAt1.equals(createdAt2)).toBe(false);
    });

    it('should return false when comparing with null', () => {
      const createdAt = CreatedAtMother.random();

      expect(createdAt.equals(null as any)).toBe(false);
    });
  });
});
