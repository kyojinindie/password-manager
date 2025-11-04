import { ValueObject } from '../../../Shared/domain/ValueObject';
import { InvalidCategoryException } from './InvalidCategoryException';

export enum CategoryType {
  PERSONAL = 'PERSONAL',
  WORK = 'WORK',
  FINANCE = 'FINANCE',
  SOCIAL = 'SOCIAL',
  EMAIL = 'EMAIL',
  SHOPPING = 'SHOPPING',
  OTHER = 'OTHER',
}

export class Category extends ValueObject<CategoryType> {
  public constructor(value: CategoryType) {
    Category.ensureIsValid(value);
    super(value);
  }

  public static fromString(value: string): Category {
    const upperValue = value.toUpperCase();

    if (!Object.values(CategoryType).includes(upperValue as CategoryType)) {
      throw new InvalidCategoryException(
        `Invalid category: ${value}. Valid values are: ${Object.values(CategoryType).join(', ')}`
      );
    }

    return new Category(upperValue as CategoryType);
  }

  public static personal(): Category {
    return new Category(CategoryType.PERSONAL);
  }

  public static work(): Category {
    return new Category(CategoryType.WORK);
  }

  public static finance(): Category {
    return new Category(CategoryType.FINANCE);
  }

  public static social(): Category {
    return new Category(CategoryType.SOCIAL);
  }

  public static email(): Category {
    return new Category(CategoryType.EMAIL);
  }

  public static shopping(): Category {
    return new Category(CategoryType.SHOPPING);
  }

  public static other(): Category {
    return new Category(CategoryType.OTHER);
  }

  private static ensureIsValid(value: CategoryType): void {
    if (!value) {
      throw new InvalidCategoryException('Category cannot be empty');
    }

    if (!Object.values(CategoryType).includes(value)) {
      throw new InvalidCategoryException(
        `Invalid category: ${value}. Valid values are: ${Object.values(CategoryType).join(', ')}`
      );
    }
  }

  public isPersonal(): boolean {
    return this._value === CategoryType.PERSONAL;
  }

  public isWork(): boolean {
    return this._value === CategoryType.WORK;
  }

  public isFinance(): boolean {
    return this._value === CategoryType.FINANCE;
  }

  public isSocial(): boolean {
    return this._value === CategoryType.SOCIAL;
  }

  public isEmail(): boolean {
    return this._value === CategoryType.EMAIL;
  }

  public isShopping(): boolean {
    return this._value === CategoryType.SHOPPING;
  }

  public isOther(): boolean {
    return this._value === CategoryType.OTHER;
  }
}
