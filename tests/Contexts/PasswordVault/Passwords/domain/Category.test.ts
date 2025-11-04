import { CategoryMother } from '../../../../mothers/CategoryMother';
import { CategoryType } from '../../../../../src/Contexts/PasswordVault/Passwords/domain/Category';
import { InvalidCategoryException } from '../../../../../src/Contexts/PasswordVault/Passwords/domain/InvalidCategoryException';

describe('Category', () => {
  describe('constructor', () => {
    it('should create Category with PERSONAL type', () => {
      const category = CategoryMother.personal();

      expect(category.value).toBe(CategoryType.PERSONAL);
    });

    it('should create Category with WORK type', () => {
      const category = CategoryMother.work();

      expect(category.value).toBe(CategoryType.WORK);
    });

    it('should create Category with FINANCE type', () => {
      const category = CategoryMother.finance();

      expect(category.value).toBe(CategoryType.FINANCE);
    });

    it('should create Category with SOCIAL type', () => {
      const category = CategoryMother.social();

      expect(category.value).toBe(CategoryType.SOCIAL);
    });

    it('should create Category with EMAIL type', () => {
      const category = CategoryMother.email();

      expect(category.value).toBe(CategoryType.EMAIL);
    });

    it('should create Category with SHOPPING type', () => {
      const category = CategoryMother.shopping();

      expect(category.value).toBe(CategoryType.SHOPPING);
    });

    it('should create Category with OTHER type', () => {
      const category = CategoryMother.other();

      expect(category.value).toBe(CategoryType.OTHER);
    });

    it('should throw error when value is null', () => {
      const nullValue = CategoryMother.invalidNull();

      expect(() => CategoryMother.create(nullValue)).toThrow(InvalidCategoryException);
      expect(() => CategoryMother.create(nullValue)).toThrow('Category cannot be empty');
    });

    it('should throw error when value is undefined', () => {
      const undefinedValue = CategoryMother.invalidUndefined();

      expect(() => CategoryMother.create(undefinedValue)).toThrow(
        InvalidCategoryException
      );
    });
  });

  describe('fromString', () => {
    it('should create Category from uppercase string', () => {
      const category = CategoryMother.fromString('PERSONAL');

      expect(category.value).toBe(CategoryType.PERSONAL);
    });

    it('should create Category from lowercase string', () => {
      const category = CategoryMother.fromString('personal');

      expect(category.value).toBe(CategoryType.PERSONAL);
    });

    it('should create Category from mixed case string', () => {
      const category = CategoryMother.fromString('PeRsOnAl');

      expect(category.value).toBe(CategoryType.PERSONAL);
    });

    it('should throw error when string is invalid category', () => {
      const invalidString = CategoryMother.invalidString();

      expect(() => CategoryMother.fromString(invalidString)).toThrow(
        InvalidCategoryException
      );
      expect(() => CategoryMother.fromString(invalidString)).toThrow(
        /Invalid category.*Valid values are/
      );
    });

    it('should throw error when string is empty', () => {
      const emptyString = CategoryMother.invalidEmpty();

      expect(() => CategoryMother.fromString(emptyString)).toThrow(
        InvalidCategoryException
      );
    });
  });

  describe('type checking methods', () => {
    it('should return true for isPersonal when category is PERSONAL', () => {
      const category = CategoryMother.personal();

      expect(category.isPersonal()).toBe(true);
      expect(category.isWork()).toBe(false);
      expect(category.isFinance()).toBe(false);
    });

    it('should return true for isWork when category is WORK', () => {
      const category = CategoryMother.work();

      expect(category.isWork()).toBe(true);
      expect(category.isPersonal()).toBe(false);
      expect(category.isFinance()).toBe(false);
    });

    it('should return true for isFinance when category is FINANCE', () => {
      const category = CategoryMother.finance();

      expect(category.isFinance()).toBe(true);
      expect(category.isPersonal()).toBe(false);
      expect(category.isWork()).toBe(false);
    });

    it('should return true for isSocial when category is SOCIAL', () => {
      const category = CategoryMother.social();

      expect(category.isSocial()).toBe(true);
      expect(category.isPersonal()).toBe(false);
    });

    it('should return true for isEmail when category is EMAIL', () => {
      const category = CategoryMother.email();

      expect(category.isEmail()).toBe(true);
      expect(category.isPersonal()).toBe(false);
    });

    it('should return true for isShopping when category is SHOPPING', () => {
      const category = CategoryMother.shopping();

      expect(category.isShopping()).toBe(true);
      expect(category.isPersonal()).toBe(false);
    });

    it('should return true for isOther when category is OTHER', () => {
      const category = CategoryMother.other();

      expect(category.isOther()).toBe(true);
      expect(category.isPersonal()).toBe(false);
    });
  });

  describe('equals', () => {
    it('should return true when comparing same category types', () => {
      const category1 = CategoryMother.personal();
      const category2 = CategoryMother.personal();

      expect(category1.equals(category2)).toBe(true);
    });

    it('should return false when comparing different category types', () => {
      const category1 = CategoryMother.personal();
      const category2 = CategoryMother.work();

      expect(category1.equals(category2)).toBe(false);
    });

    it('should return false when comparing with null', () => {
      const category = CategoryMother.personal();

      expect(category.equals(null as any)).toBe(false);
    });
  });

  describe('immutability', () => {
    it('should not allow modification of category value', () => {
      const category = CategoryMother.personal();
      const originalValue = category.value;

      expect(() => {
        (category as any).value = CategoryType.WORK;
      }).toThrow();

      expect(category.value).toBe(originalValue);
    });
  });
});
