import { faker } from '@faker-js/faker';

export class MasterPasswordMother {
  public static random(): string {
    // Generate a strong password that meets all requirements
    const lowercase = faker.string.alpha({ length: 3, casing: 'lower' });
    const uppercase = faker.string.alpha({ length: 3, casing: 'upper' });
    const numbers = faker.string.numeric(3);
    const special = '!@#$%';

    return `${uppercase}${lowercase}${numbers}${special}`;
  }

  public static strong(): string {
    return 'SecureP@ssw0rd123!';
  }

  public static invalidTooShort(): string {
    return 'Short1!';
  }

  public static invalidNoUppercase(): string {
    return 'securepassword123!';
  }

  public static invalidNoLowercase(): string {
    return 'SECUREPASSWORD123!';
  }

  public static invalidNoNumber(): string {
    return 'SecurePassword!@#';
  }

  public static invalidNoSpecialChar(): string {
    return 'SecurePassword123';
  }

  public static invalidEmpty(): string {
    return '';
  }
}
