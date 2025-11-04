import { faker } from '@faker-js/faker';
import { PasswordEntryId } from '../../src/Contexts/PasswordVault/Passwords/domain/PasswordEntryId';

export class PasswordEntryIdMother {
  public static create(value: string): PasswordEntryId {
    return new PasswordEntryId(value);
  }

  public static random(): PasswordEntryId {
    return PasswordEntryId.generate();
  }

  public static withValue(value: string): PasswordEntryId {
    return new PasswordEntryId(value);
  }

  public static validUUID(): string {
    return faker.string.uuid();
  }

  public static invalidEmpty(): string {
    return '';
  }

  public static invalidBlank(): string {
    return '   ';
  }

  public static invalidNull(): any {
    return null;
  }

  public static invalidUndefined(): any {
    return undefined;
  }
}
