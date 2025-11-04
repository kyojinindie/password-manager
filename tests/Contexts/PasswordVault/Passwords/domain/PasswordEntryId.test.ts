import { PasswordEntryIdMother } from '../../../../mothers/PasswordEntryIdMother';
import { PasswordEntryId } from '../../../../../src/Contexts/PasswordVault/Passwords/domain/PasswordEntryId';

describe('PasswordEntryId', () => {
  describe('constructor', () => {
    it('should create PasswordEntryId with valid UUID', () => {
      const validUUID = PasswordEntryIdMother.validUUID();
      const passwordEntryId = PasswordEntryIdMother.create(validUUID);

      expect(passwordEntryId.value).toBe(validUUID);
    });

    it('should throw error when value is empty', () => {
      const emptyValue = PasswordEntryIdMother.invalidEmpty();

      expect(() => PasswordEntryIdMother.create(emptyValue)).toThrow(
        'PasswordEntryId cannot be empty'
      );
    });

    it('should throw error when value is blank', () => {
      const blankValue = PasswordEntryIdMother.invalidBlank();

      expect(() => PasswordEntryIdMother.create(blankValue)).toThrow(
        'PasswordEntryId cannot be empty'
      );
    });

    it('should throw error when value is null', () => {
      const nullValue = PasswordEntryIdMother.invalidNull();

      expect(() => PasswordEntryIdMother.create(nullValue)).toThrow(
        'PasswordEntryId cannot be empty'
      );
    });

    it('should throw error when value is undefined', () => {
      const undefinedValue = PasswordEntryIdMother.invalidUndefined();

      expect(() => PasswordEntryIdMother.create(undefinedValue)).toThrow(
        'PasswordEntryId cannot be empty'
      );
    });
  });

  describe('generate', () => {
    it('should generate valid PasswordEntryId', () => {
      const passwordEntryId = PasswordEntryIdMother.random();

      expect(passwordEntryId).toBeInstanceOf(PasswordEntryId);
      expect(passwordEntryId.value).toBeDefined();
      expect(typeof passwordEntryId.value).toBe('string');
    });

    it('should generate unique IDs', () => {
      const id1 = PasswordEntryIdMother.random();
      const id2 = PasswordEntryIdMother.random();

      expect(id1.equals(id2)).toBe(false);
    });

    it('should generate valid UUID format', () => {
      const passwordEntryId = PasswordEntryIdMother.random();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      expect(passwordEntryId.value).toMatch(uuidRegex);
    });
  });

  describe('equals', () => {
    it('should return true when comparing same ID values', () => {
      const value = PasswordEntryIdMother.validUUID();
      const id1 = PasswordEntryIdMother.create(value);
      const id2 = PasswordEntryIdMother.create(value);

      expect(id1.equals(id2)).toBe(true);
    });

    it('should return false when comparing different IDs', () => {
      const id1 = PasswordEntryIdMother.random();
      const id2 = PasswordEntryIdMother.random();

      expect(id1.equals(id2)).toBe(false);
    });

    it('should return false when comparing with null', () => {
      const id = PasswordEntryIdMother.random();

      expect(id.equals(null as any)).toBe(false);
    });
  });

  describe('immutability', () => {
    it('should not allow modification of ID value', () => {
      const originalValue = PasswordEntryIdMother.validUUID();
      const id = PasswordEntryIdMother.create(originalValue);

      expect(id.value).toBe(originalValue);
      expect(() => {
        (id as any).value = 'new-value';
      }).toThrow();
    });
  });
});
