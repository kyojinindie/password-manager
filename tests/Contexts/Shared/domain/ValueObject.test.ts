import {
  StringValueObjectMother,
  NumberValueObjectMother,
  ComplexValueObjectMother,
} from '../../../mothers/ValueObjectMother';

describe('ValueObject', () => {
  describe('equals', () => {
    it('should return true when comparing two value objects with same primitive value', () => {
      const value = 'test-value';
      const vo1 = StringValueObjectMother.withValue(value);
      const vo2 = StringValueObjectMother.withValue(value);

      expect(vo1.equals(vo2)).toBe(true);
    });

    it('should return false when comparing two value objects with different primitive values', () => {
      const vo1 = StringValueObjectMother.random();
      const vo2 = StringValueObjectMother.random();

      expect(vo1.equals(vo2)).toBe(false);
    });

    it('should return true when comparing two value objects with same number value', () => {
      const vo1 = NumberValueObjectMother.fortyTwo();
      const vo2 = NumberValueObjectMother.fortyTwo();

      expect(vo1.equals(vo2)).toBe(true);
    });

    it('should return false when comparing two value objects with different number values', () => {
      const vo1 = NumberValueObjectMother.withValue(42);
      const vo2 = NumberValueObjectMother.withValue(43);

      expect(vo1.equals(vo2)).toBe(false);
    });

    it('should return true when comparing two value objects with same complex value', () => {
      const vo1 = ComplexValueObjectMother.johnDoe();
      const vo2 = ComplexValueObjectMother.johnDoe();

      expect(vo1.equals(vo2)).toBe(true);
    });

    it('should return false when comparing two value objects with different complex values', () => {
      const vo1 = ComplexValueObjectMother.johnDoe();
      const vo2 = ComplexValueObjectMother.janeDoe();

      expect(vo1.equals(vo2)).toBe(false);
    });

    it('should return false when comparing with null', () => {
      const vo1 = StringValueObjectMother.random();

      expect(vo1.equals(null as any)).toBe(false);
    });

    it('should return false when comparing with undefined', () => {
      const vo1 = StringValueObjectMother.random();

      expect(vo1.equals(undefined as any)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return string representation of primitive value', () => {
      const value = 'test-value';
      const vo = StringValueObjectMother.withValue(value);

      expect(vo.toString()).toBe(value);
    });

    it('should return string representation of number value', () => {
      const vo = NumberValueObjectMother.fortyTwo();

      expect(vo.toString()).toBe('42');
    });

    it('should return string representation of complex value', () => {
      const vo = ComplexValueObjectMother.johnDoe();

      expect(vo.toString()).toBe('[object Object]');
    });
  });

  describe('value getter', () => {
    it('should return the encapsulated value', () => {
      const value = 'test-value';
      const vo = StringValueObjectMother.withValue(value);

      expect(vo.value).toBe(value);
    });

    it('should return the encapsulated number value', () => {
      const vo = NumberValueObjectMother.fortyTwo();

      expect(vo.value).toBe(42);
    });

    it('should return the encapsulated complex value', () => {
      const vo = ComplexValueObjectMother.johnDoe();

      expect(vo.value).toEqual({ name: 'John Doe', age: 30 });
    });
  });
});
