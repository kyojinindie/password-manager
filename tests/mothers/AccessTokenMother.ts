import { faker } from '@faker-js/faker';
import { AccessToken } from '../../src/Contexts/Authentication/Users/domain/AccessToken';

export class AccessTokenMother {
  public static create(value: string): AccessToken {
    return new AccessToken(value);
  }

  public static random(): AccessToken {
    return new AccessToken(this.generateValidJWT());
  }

  public static withPayload(_payload: Record<string, any>): AccessToken {
    return new AccessToken(this.generateValidJWT());
  }

  public static validJWT(): AccessToken {
    return new AccessToken(this.generateValidJWT());
  }

  public static generateValidJWT(): string {
    // Generate a JWT-like structure with 3 parts separated by dots
    const header = faker.string.alphanumeric(20);
    const payload = faker.string.alphanumeric(50);
    const signature = faker.string.alphanumeric(30);
    return `${header}.${payload}.${signature}`;
  }

  public static validJWTValue(): string {
    return this.generateValidJWT();
  }

  public static invalidEmpty(): string {
    return '';
  }

  public static invalidBlank(): string {
    return '   ';
  }

  public static invalidMissingParts(): string {
    return 'invalid.token';
  }

  public static invalidSinglePart(): string {
    return 'invalidtoken';
  }

  public static invalidEmptyPart(): string {
    return `${faker.string.alphanumeric(20)}..${faker.string.alphanumeric(30)}`;
  }

  public static invalidNonString(): any {
    return 123;
  }
}
