import { ValueObject } from '../../../Shared/domain/ValueObject';
import { InvalidUsernameException } from './InvalidUsernameException';

export class Username extends ValueObject<string> {
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
    if (!value || value.length === 0) {
      throw new InvalidUsernameException('Username cannot be empty');
    }
  }
}
