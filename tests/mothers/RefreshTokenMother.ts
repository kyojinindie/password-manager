import { faker } from '@faker-js/faker';
import { RefreshToken } from '../../src/Contexts/Authentication/Users/domain/RefreshToken';

export class RefreshTokenMother {
  public static create(value: string): RefreshToken {
    return new RefreshToken(value);
  }

  public static random(): RefreshToken {
    return new RefreshToken(this.generateValidJWT());
  }

  public static withPayload(_payload: Record<string, any>): RefreshToken {
    return new RefreshToken(this.generateValidJWT());
  }

  public static validJWT(): RefreshToken {
    return new RefreshToken(this.generateValidJWT());
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
