import { ValueObject } from '../../../Shared/domain/ValueObject';

export class Email extends ValueObject<string> {
  public constructor(value: string) {
    const normalizedValue = Email.normalize(value);
    Email.ensureIsValid(normalizedValue);
    super(normalizedValue);
  }

  public get domain(): string {
    return this._value.split('@')[1];
  }

  private static normalize(value: string): string {
    if (!value) {
      return value;
    }
    return value.toLowerCase().trim();
  }

  private static ensureIsValid(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('Email cannot be empty');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new Error('Invalid email format');
    }
  }
}
