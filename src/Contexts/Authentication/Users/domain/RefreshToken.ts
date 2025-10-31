import { ValueObject } from '../../../Shared/domain/ValueObject';

export class RefreshToken extends ValueObject<string> {
  private static readonly EXPIRATION_DAYS = 7;

  public constructor(value: string) {
    RefreshToken.ensureIsValid(value);
    super(value);
  }

  public static getExpirationDays(): number {
    return RefreshToken.EXPIRATION_DAYS;
  }

  public getExpirationDate(): Date {
    const now = new Date();
    return new Date(now.getTime() + RefreshToken.EXPIRATION_DAYS * 24 * 60 * 60 * 1000);
  }

  private static ensureIsValid(value: string): void {
    if (!value) {
      throw new Error('RefreshToken cannot be empty');
    }

    if (typeof value !== 'string') {
      throw new Error('RefreshToken must be a string');
    }

    if (value.trim().length === 0) {
      throw new Error('RefreshToken cannot be blank');
    }

    // JWT tokens have 3 parts separated by dots
    const parts = value.split('.');
    if (parts.length !== 3) {
      throw new Error('RefreshToken must be a valid JWT format');
    }

    // Each part should be a non-empty base64url string
    for (const part of parts) {
      if (!part || part.trim().length === 0) {
        throw new Error('RefreshToken JWT parts cannot be empty');
      }
    }
  }
}
