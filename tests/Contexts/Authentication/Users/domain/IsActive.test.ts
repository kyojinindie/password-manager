import { IsActiveMother } from '../../../../mothers/IsActiveMother';

describe('IsActive', () => {
  describe('constructor', () => {
    it('should create IsActive with true value', () => {
      const isActive = IsActiveMother.active();

      expect(isActive.value).toBe(true);
    });

    it('should create IsActive with false value', () => {
      const isActive = IsActiveMother.inactive();

      expect(isActive.value).toBe(false);
    });

    it('should throw error when value is null', () => {
      expect(() => IsActiveMother.create(null as any)).toThrow(
        'IsActive cannot be null or undefined'
      );
    });

    it('should throw error when value is undefined', () => {
      expect(() => IsActiveMother.create(undefined as any)).toThrow(
        'IsActive cannot be null or undefined'
      );
    });
  });

  describe('equals', () => {
    it('should return true when comparing same boolean values', () => {
      const isActive1 = IsActiveMother.active();
      const isActive2 = IsActiveMother.active();

      expect(isActive1.equals(isActive2)).toBe(true);
    });

    it('should return false when comparing different boolean values', () => {
      const isActive1 = IsActiveMother.active();
      const isActive2 = IsActiveMother.inactive();

      expect(isActive1.equals(isActive2)).toBe(false);
    });

    it('should return false when comparing with null', () => {
      const isActive = IsActiveMother.active();

      expect(isActive.equals(null as any)).toBe(false);
    });
  });

  describe('isTrue', () => {
    it('should return true when value is true', () => {
      const isActive = IsActiveMother.active();

      expect(isActive.isTrue()).toBe(true);
    });

    it('should return false when value is false', () => {
      const isActive = IsActiveMother.inactive();

      expect(isActive.isTrue()).toBe(false);
    });
  });

  describe('isFalse', () => {
    it('should return true when value is false', () => {
      const isActive = IsActiveMother.inactive();

      expect(isActive.isFalse()).toBe(true);
    });

    it('should return false when value is true', () => {
      const isActive = IsActiveMother.active();

      expect(isActive.isFalse()).toBe(false);
    });
  });
});
