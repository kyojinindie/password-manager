import { ValueObject } from '../../../Shared/domain/ValueObject';

export class MasterPasswordHash extends ValueObject<string> {
  public constructor(value: string) {
    MasterPasswordHash.ensureIsValid(value);
    super(value);
  }

  private static ensureIsValid(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('MasterPasswordHash cannot be empty');
    }
  }
}
