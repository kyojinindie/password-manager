import { ValueObject } from '../../../Shared/domain/ValueObject';

export class Username extends ValueObject<string> {
  private static readonly MIN_LENGTH = 3;
  private static readonly MAX_LENGTH = 50;

  public constructor(value: string) {
    const normalizedValue = Username.normalize(value);
    Username.ensureIsValid(normalizedValue);
    super(normalizedValue);
  }

  private static normalize(value: string): string {
    if (!value) {
      return value;
    }
    return value.trim();
  }

  private static ensureIsValid(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('Username cannot be empty');
    }

    if (value.length < this.MIN_LENGTH || value.length > this.MAX_LENGTH) {
      throw new Error(
        `Username must be between ${this.MIN_LENGTH} and ${this.MAX_LENGTH} characters`
      );
    }
  }
}
