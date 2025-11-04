import { faker } from '@faker-js/faker';
import { SiteUrl } from '../../src/Contexts/PasswordVault/Passwords/domain/SiteUrl';

export class SiteUrlMother {
  public static create(value: string | null): SiteUrl {
    return new SiteUrl(value);
  }

  public static random(): SiteUrl {
    return new SiteUrl(faker.internet.url());
  }

  public static empty(): SiteUrl {
    return SiteUrl.empty();
  }

  public static withValue(value: string): SiteUrl {
    return new SiteUrl(value);
  }

  public static google(): SiteUrl {
    return new SiteUrl('https://www.google.com');
  }

  public static github(): SiteUrl {
    return new SiteUrl('https://github.com');
  }

  public static withHttp(): SiteUrl {
    return new SiteUrl('http://example.com');
  }

  public static withHttps(): SiteUrl {
    return new SiteUrl('https://example.com');
  }

  public static withPort(): SiteUrl {
    return new SiteUrl('https://localhost:3000');
  }

  public static withPath(): SiteUrl {
    return new SiteUrl('https://example.com/login');
  }

  public static withQueryParams(): SiteUrl {
    return new SiteUrl('https://example.com?param=value');
  }

  public static invalidEmptyString(): string {
    return '';
  }

  public static invalidBlank(): string {
    return '   ';
  }

  public static invalidFormat(): string {
    return 'not-a-url';
  }

  public static invalidNoProtocol(): string {
    return 'www.example.com';
  }

  public static invalidMalformed(): string {
    return 'https://';
  }
}
