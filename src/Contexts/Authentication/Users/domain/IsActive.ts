import { ValueObject } from '../../../Shared/domain/ValueObject';

export class IsActive extends ValueObject<boolean> {
  public constructor(value: boolean) {
    IsActive.ensureIsValid(value);
    super(value);
  }

  public isTrue(): boolean {
    return this._value === true;
  }

  public isFalse(): boolean {
    return this._value === false;
  }

  private static ensureIsValid(value: boolean): void {
    if (value === null || value === undefined) {
      throw new Error('IsActive cannot be null or undefined');
    }
  }
}
