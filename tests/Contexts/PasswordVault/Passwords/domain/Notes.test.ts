import { NotesMother } from '../../../../mothers/NotesMother';
import { InvalidNotesException } from '../../../../../src/Contexts/PasswordVault/Passwords/domain/InvalidNotesException';

describe('Notes', () => {
  describe('constructor', () => {
    it('should create Notes with valid value', () => {
      const notes = NotesMother.short();

      expect(notes.value).toBe('This is a short note');
    });

    it('should create Notes with null value', () => {
      const notes = NotesMother.nullValue();

      expect(notes.value).toBeNull();
    });

    it('should create Notes with random value', () => {
      const notes = NotesMother.random();

      expect(notes.value).toBeDefined();
      expect(typeof notes.value).toBe('string');
    });

    it('should create Notes with long text', () => {
      const notes = NotesMother.long();

      expect(notes.value).toBeDefined();
      expect(notes.value!.length).toBeGreaterThan(50);
    });

    it('should accept notes at max length', () => {
      const notes = NotesMother.maxLength();

      expect(notes.value).toHaveLength(1000);
    });

    it('should normalize empty string to null', () => {
      const notes = NotesMother.emptyString();

      expect(notes.value).toBeNull();
    });

    it('should normalize blank string to null', () => {
      const notes = NotesMother.blankString();

      expect(notes.value).toBeNull();
    });

    it('should trim whitespace from value', () => {
      const notes = NotesMother.withSpaces();

      expect(notes.value).toBe('Some notes with spaces');
      expect(notes.value).not.toMatch(/^\s+|\s+$/);
    });

    it('should preserve newlines in notes', () => {
      const notes = NotesMother.withNewlines();

      expect(notes.value).toContain('\n');
      expect(notes.value).toBe('Line 1\nLine 2\nLine 3');
    });

    it('should throw error when value exceeds max length', () => {
      const tooLong = NotesMother.invalidTooLong();

      expect(() => NotesMother.create(tooLong)).toThrow(InvalidNotesException);
      expect(() => NotesMother.create(tooLong)).toThrow(
        'Notes cannot exceed 1000 characters'
      );
    });
  });

  describe('empty', () => {
    it('should create empty Notes', () => {
      const notes = NotesMother.empty();

      expect(notes.isEmpty()).toBe(true);
      expect(notes.value).toBeNull();
    });
  });

  describe('isEmpty', () => {
    it('should return true when notes is null', () => {
      const notes = NotesMother.empty();

      expect(notes.isEmpty()).toBe(true);
    });

    it('should return true when notes is empty string', () => {
      const notes = NotesMother.emptyString();

      expect(notes.isEmpty()).toBe(true);
    });

    it('should return false when notes has value', () => {
      const notes = NotesMother.short();

      expect(notes.isEmpty()).toBe(false);
    });
  });

  describe('equals', () => {
    it('should return true when comparing same note values', () => {
      const notes1 = NotesMother.create('Same note');
      const notes2 = NotesMother.create('Same note');

      expect(notes1.equals(notes2)).toBe(true);
    });

    it('should return true when both are empty', () => {
      const notes1 = NotesMother.empty();
      const notes2 = NotesMother.empty();

      expect(notes1.equals(notes2)).toBe(true);
    });

    it('should return false when comparing different notes', () => {
      const notes1 = NotesMother.short();
      const notes2 = NotesMother.long();

      expect(notes1.equals(notes2)).toBe(false);
    });

    it('should return false when one is empty and other is not', () => {
      const notes1 = NotesMother.short();
      const notes2 = NotesMother.empty();

      expect(notes1.equals(notes2)).toBe(false);
    });

    it('should return false when comparing with null', () => {
      const notes = NotesMother.short();

      expect(notes.equals(null as any)).toBe(false);
    });
  });

  describe('immutability', () => {
    it('should not allow modification of value', () => {
      const notes = NotesMother.short();
      const originalValue = notes.value;

      expect(() => {
        (notes as any).value = 'Modified notes';
      }).toThrow();

      expect(notes.value).toBe(originalValue);
    });
  });
});
