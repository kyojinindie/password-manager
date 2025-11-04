import {
  Category,
  CategoryType,
} from '../../src/Contexts/PasswordVault/Passwords/domain/Category';

export class CategoryMother {
  public static create(value: CategoryType): Category {
    return new Category(value);
  }

  public static random(): Category {
    const types = Object.values(CategoryType);
    const randomType = types[Math.floor(Math.random() * types.length)];
    return new Category(randomType);
  }

  public static personal(): Category {
    return Category.personal();
  }

  public static work(): Category {
    return Category.work();
  }

  public static finance(): Category {
    return Category.finance();
  }

  public static social(): Category {
    return Category.social();
  }

  public static email(): Category {
    return Category.email();
  }

  public static shopping(): Category {
    return Category.shopping();
  }

  public static other(): Category {
    return Category.other();
  }

  public static fromString(value: string): Category {
    return Category.fromString(value);
  }

  public static validString(): string {
    return 'PERSONAL';
  }

  public static validLowercase(): string {
    return 'personal';
  }

  public static validMixedCase(): string {
    return 'PeRsOnAl';
  }

  public static invalidString(): string {
    return 'INVALID_CATEGORY';
  }

  public static invalidEmpty(): string {
    return '';
  }

  public static invalidNull(): any {
    return null;
  }

  public static invalidUndefined(): any {
    return undefined;
  }
}
