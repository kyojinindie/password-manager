import { ValueObject } from '../../../Shared/domain/ValueObject';

export class AccessToken extends ValueObject<string> {
  private static readonly EXPIRATION_MINUTES = 15;

  public constructor(value: string) {
    AccessToken.ensureIsValid(value);
    super(value);
  }

  public static getExpirationMinutes(): number {
    return AccessToken.EXPIRATION_MINUTES;
  }

  public getExpirationDate(): Date {
    const now = new Date();
    return new Date(now.getTime() + AccessToken.EXPIRATION_MINUTES * 60 * 1000);
  }

  private static ensureIsValid(value: string): void {
    if (!value) {
      throw new Error('AccessToken cannot be empty');
    }

    if (typeof value !== 'string') {
      throw new Error('AccessToken must be a string');
    }

    if (value.trim().length === 0) {
      throw new Error('AccessToken cannot be blank');
    }

    // JWT tokens have 3 parts separated by dots
    const parts = value.split('.');
    if (parts.length !== 3) {
      throw new Error('AccessToken must be a valid JWT format');
    }

    // Each part should be a non-empty base64url string
    for (const part of parts) {
      if (!part || part.trim().length === 0) {
        throw new Error('AccessToken JWT parts cannot be empty');
      }
    }
  }
}
