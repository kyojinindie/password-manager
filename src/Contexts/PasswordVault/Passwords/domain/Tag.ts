import { ValueObject } from '../../../Shared/domain/ValueObject';
import { InvalidTagException } from './InvalidTagException';

export class Tag extends ValueObject<string> {
  private static readonly MAX_LENGTH = 30;

  public constructor(value: string) {
    const normalizedValue = Tag.normalize(value);
    Tag.ensureIsValid(normalizedValue);
    super(normalizedValue);
  }

  private static normalize(value: string): string {
    if (!value) {
      return value;
    }
    // Convert to lowercase and trim
    return value.toLowerCase().trim();
  }

  private static ensureIsValid(value: string): void {
    if (!value || value.length === 0) {
      throw new InvalidTagException('Tag cannot be empty');
    }

    if (value.length > Tag.MAX_LENGTH) {
      throw new InvalidTagException(`Tag cannot exceed ${Tag.MAX_LENGTH} characters`);
    }

    // Tags should not contain spaces
    if (value.includes(' ')) {
      throw new InvalidTagException('Tag cannot contain spaces');
    }

    // Tags should only contain alphanumeric characters, hyphens, and underscores
    const tagRegex = /^[a-z0-9_-]+$/;
    if (!tagRegex.test(value)) {
      throw new InvalidTagException(
        'Tag can only contain lowercase letters, numbers, hyphens, and underscores'
      );
    }
  }
}
