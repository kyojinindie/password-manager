import { ValueObject } from '../../../Shared/domain/ValueObject';
import { InvalidSiteNameException } from './InvalidSiteNameException';

export class SiteName extends ValueObject<string> {
  private static readonly MAX_LENGTH = 100;

  public constructor(value: string) {
    const normalizedValue = SiteName.normalize(value);
    SiteName.ensureIsValid(normalizedValue);
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
      throw new InvalidSiteNameException('Site name cannot be empty');
    }

    if (value.length > SiteName.MAX_LENGTH) {
      throw new InvalidSiteNameException(
        `Site name cannot exceed ${SiteName.MAX_LENGTH} characters`
      );
    }
  }
}
