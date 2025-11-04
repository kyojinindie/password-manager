import { ValueObject } from '../../../Shared/domain/ValueObject';
import { InvalidNotesException } from './InvalidNotesException';

export class Notes extends ValueObject<string | null> {
  private static readonly MAX_LENGTH = 1000;

  public constructor(value: string | null) {
    const normalizedValue = Notes.normalize(value);
    Notes.ensureIsValid(normalizedValue);
    super(normalizedValue);
  }

  public static empty(): Notes {
    return new Notes(null);
  }

  public isEmpty(): boolean {
    return this._value === null || this._value.length === 0;
  }

  private static normalize(value: string | null): string | null {
    if (!value) {
      return null;
    }
    const trimmed = value.trim();
    return trimmed.length === 0 ? null : trimmed;
  }

  private static ensureIsValid(value: string | null): void {
    if (value === null) {
      return;
    }

    if (value.length > Notes.MAX_LENGTH) {
      throw new InvalidNotesException(
        `Notes cannot exceed ${Notes.MAX_LENGTH} characters`
      );
    }
  }
}
