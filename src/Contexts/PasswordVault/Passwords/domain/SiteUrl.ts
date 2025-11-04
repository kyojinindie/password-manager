import { ValueObject } from '../../../Shared/domain/ValueObject';
import { InvalidSiteUrlException } from './InvalidSiteUrlException';

export class SiteUrl extends ValueObject<string | null> {
  public constructor(value: string | null) {
    const normalizedValue = SiteUrl.normalize(value);
    SiteUrl.ensureIsValid(normalizedValue);
    super(normalizedValue);
  }

  public static empty(): SiteUrl {
    return new SiteUrl(null);
  }

  public isEmpty(): boolean {
    return this._value === null;
  }

  private static normalize(value: string | null): string | null {
    if (!value) {
      return null;
    }
    return value.trim();
  }

  private static ensureIsValid(value: string | null): void {
    if (value === null) {
      return;
    }

    if (value.length === 0) {
      throw new InvalidSiteUrlException('URL cannot be empty string, use null instead');
    }

    try {
      new URL(value);
    } catch {
      throw new InvalidSiteUrlException('Invalid URL format');
    }
  }

  public get domain(): string | null {
    if (!this._value) {
      return null;
    }
    try {
      return new URL(this._value).hostname;
    } catch {
      return null;
    }
  }
}
