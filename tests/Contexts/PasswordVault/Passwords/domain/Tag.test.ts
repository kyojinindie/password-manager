import { TagMother } from '../../../../mothers/TagMother';
import { InvalidTagException } from '../../../../../src/Contexts/PasswordVault/Passwords/domain/InvalidTagException';

describe('Tag', () => {
  describe('constructor', () => {
    it('should create Tag with valid value', () => {
      const tag = TagMother.important();

      expect(tag.value).toBe('important');
    });

    it('should create Tag with random value', () => {
      const tag = TagMother.random();

      expect(tag.value).toBeDefined();
      expect(typeof tag.value).toBe('string');
      expect(tag.value.length).toBeGreaterThan(0);
    });

    it('should normalize value to lowercase', () => {
      const tag = TagMother.create(TagMother.uppercase());

      expect(tag.value).toBe('uppercase');
    });

    it('should normalize mixed case to lowercase', () => {
      const tag = TagMother.create(TagMother.mixedCase());

      expect(tag.value).toBe('mixedcase');
    });

    it('should trim whitespace from value', () => {
      const tag = TagMother.create('  work  ');

      expect(tag.value).toBe('work');
      expect(tag.value).not.toMatch(/^\s+|\s+$/);
    });

    it('should accept tag with hyphen', () => {
      const tag = TagMother.withHyphen();

      expect(tag.value).toBe('two-words');
    });

    it('should accept tag with underscore', () => {
      const tag = TagMother.withUnderscore();

      expect(tag.value).toBe('two_words');
    });

    it('should accept tag with numbers', () => {
      const tag = TagMother.withNumbers();

      expect(tag.value).toBe('tag123');
    });

    it('should accept tag at max length', () => {
      const tag = TagMother.maxLength();

      expect(tag.value).toHaveLength(30);
    });

    it('should throw error when value is empty', () => {
      const emptyValue = TagMother.invalidEmpty();

      expect(() => TagMother.create(emptyValue)).toThrow(InvalidTagException);
      expect(() => TagMother.create(emptyValue)).toThrow('Tag cannot be empty');
    });

    it('should throw error when value is blank', () => {
      const blankValue = TagMother.invalidBlank();

      expect(() => TagMother.create(blankValue)).toThrow(InvalidTagException);
      expect(() => TagMother.create(blankValue)).toThrow('Tag cannot be empty');
    });

    it('should throw error when value exceeds max length', () => {
      const tooLong = TagMother.invalidTooLong();

      expect(() => TagMother.create(tooLong)).toThrow(InvalidTagException);
      expect(() => TagMother.create(tooLong)).toThrow('Tag cannot exceed 30 characters');
    });

    it('should throw error when value contains spaces', () => {
      const withSpaces = TagMother.invalidWithSpaces();

      expect(() => TagMother.create(withSpaces)).toThrow(InvalidTagException);
      expect(() => TagMother.create(withSpaces)).toThrow('Tag cannot contain spaces');
    });

    it('should throw error when value contains special characters', () => {
      const specialChars = TagMother.invalidSpecialChars();

      expect(() => TagMother.create(specialChars)).toThrow(InvalidTagException);
      expect(() => TagMother.create(specialChars)).toThrow(
        'Tag can only contain lowercase letters, numbers, hyphens, and underscores'
      );
    });

    it('should throw error when value is null', () => {
      const nullValue = TagMother.invalidNull();

      expect(() => TagMother.create(nullValue)).toThrow(InvalidTagException);
    });

    it('should throw error when value is undefined', () => {
      const undefinedValue = TagMother.invalidUndefined();

      expect(() => TagMother.create(undefinedValue)).toThrow(InvalidTagException);
    });
  });

  describe('equals', () => {
    it('should return true when comparing same tag values', () => {
      const tag1 = TagMother.important();
      const tag2 = TagMother.important();

      expect(tag1.equals(tag2)).toBe(true);
    });

    it('should return false when comparing different tags', () => {
      const tag1 = TagMother.important();
      const tag2 = TagMother.work();

      expect(tag1.equals(tag2)).toBe(false);
    });

    it('should return true when comparing normalized values', () => {
      const tag1 = TagMother.create('WORK');
      const tag2 = TagMother.create('work');

      expect(tag1.equals(tag2)).toBe(true);
    });

    it('should return false when comparing with null', () => {
      const tag = TagMother.important();

      expect(tag.equals(null as any)).toBe(false);
    });
  });

  describe('immutability', () => {
    it('should not allow modification of tag value', () => {
      const tag = TagMother.important();
      const originalValue = tag.value;

      expect(() => {
        (tag as any).value = 'modified';
      }).toThrow();

      expect(tag.value).toBe(originalValue);
    });
  });
});
