import { ValueObject } from '../../../Shared/domain/ValueObject';

export class Salt extends ValueObject<string> {
  public constructor(value: string) {
    Salt.ensureIsValid(value);
    super(value);
  }

  private static ensureIsValid(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('Salt cannot be empty');
    }
  }
}
