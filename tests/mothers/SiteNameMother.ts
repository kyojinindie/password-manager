import { faker } from '@faker-js/faker';
import { SiteName } from '../../src/Contexts/PasswordVault/Passwords/domain/SiteName';

export class SiteNameMother {
  public static create(value: string): SiteName {
    return new SiteName(value);
  }

  public static random(): SiteName {
    return new SiteName(faker.company.name());
  }

  public static withValue(value: string): SiteName {
    return new SiteName(value);
  }

  public static google(): SiteName {
    return new SiteName('Google');
  }

  public static facebook(): SiteName {
    return new SiteName('Facebook');
  }

  public static github(): SiteName {
    return new SiteName('GitHub');
  }

  public static maxLength(): SiteName {
    return new SiteName('a'.repeat(100));
  }

  public static invalidEmpty(): string {
    return '';
  }

  public static invalidBlank(): string {
    return '   ';
  }

  public static invalidTooLong(): string {
    return 'a'.repeat(101);
  }

  public static invalidNull(): any {
    return null;
  }

  public static invalidUndefined(): any {
    return undefined;
  }

  public static withSpaces(): SiteName {
    return new SiteName('  My Site Name  ');
  }
}
