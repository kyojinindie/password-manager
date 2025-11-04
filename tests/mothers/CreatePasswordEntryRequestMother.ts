import { faker } from '@faker-js/faker';
import { CreatePasswordEntryRequest } from '../../src/Contexts/PasswordVault/Passwords/application/Create/CreatePasswordEntryRequest';
import { CategoryType } from '../../src/Contexts/PasswordVault/Passwords/domain/Category';

/**
 * Mother Object for CreatePasswordEntryRequest DTO
 *
 * Provides factory methods to create test data for the application layer DTO.
 * This is a DTO Mother, so it works with primitives only.
 */
export class CreatePasswordEntryRequestMother {
  /**
   * Creates a request with the specified values.
   */
  public static create(
    userId: string,
    siteName: string,
    username: string,
    password: string,
    category: string,
    siteUrl?: string,
    notes?: string,
    tags?: string[]
  ): CreatePasswordEntryRequest {
    return {
      userId,
      siteName,
      username,
      password,
      category,
      siteUrl,
      notes,
      tags,
    };
  }

  /**
   * Creates a random valid request with all fields.
   */
  public static random(): CreatePasswordEntryRequest {
    return {
      userId: faker.string.uuid(),
      siteName: faker.company.name(),
      siteUrl: faker.internet.url(),
      username: faker.internet.username(),
      password: faker.internet.password({ length: 16 }),
      category: this.randomCategory(),
      notes: faker.lorem.sentence(),
      tags: this.randomTags(),
    };
  }

  /**
   * Creates a valid request with only required fields.
   */
  public static withRequiredFieldsOnly(): CreatePasswordEntryRequest {
    return {
      userId: faker.string.uuid(),
      siteName: faker.company.name(),
      username: faker.internet.username(),
      password: faker.internet.password({ length: 16 }),
      category: CategoryType.PERSONAL,
    };
  }

  /**
   * Creates a request with all optional fields included.
   */
  public static withAllFields(): CreatePasswordEntryRequest {
    return {
      userId: faker.string.uuid(),
      siteName: 'GitHub',
      siteUrl: 'https://github.com',
      username: 'johndoe',
      password: 'MySecurePassword123!',
      category: CategoryType.WORK,
      notes: 'This is my work GitHub account',
      tags: ['important', 'work', 'development'],
    };
  }

  /**
   * Creates a request for a specific user ID.
   */
  public static forUser(userId: string): CreatePasswordEntryRequest {
    return {
      userId,
      siteName: faker.company.name(),
      username: faker.internet.username(),
      password: faker.internet.password({ length: 16 }),
      category: CategoryType.PERSONAL,
    };
  }

  /**
   * Creates a request for Google.
   */
  public static google(): CreatePasswordEntryRequest {
    return {
      userId: faker.string.uuid(),
      siteName: 'Google',
      siteUrl: 'https://www.google.com',
      username: 'user@gmail.com',
      password: 'GooglePassword123!',
      category: CategoryType.EMAIL,
      tags: ['email', 'personal'],
    };
  }

  /**
   * Creates a request for GitHub.
   */
  public static github(): CreatePasswordEntryRequest {
    return {
      userId: faker.string.uuid(),
      siteName: 'GitHub',
      siteUrl: 'https://github.com',
      username: 'developer',
      password: 'GitHubSecure2024!',
      category: CategoryType.WORK,
      notes: 'Development account',
      tags: ['work', 'development'],
    };
  }

  /**
   * Creates a request for a banking site.
   */
  public static banking(): CreatePasswordEntryRequest {
    return {
      userId: faker.string.uuid(),
      siteName: 'Bank of America',
      siteUrl: 'https://www.bankofamerica.com',
      username: 'customer123',
      password: 'BankSecure2024!',
      category: CategoryType.FINANCE,
      notes: 'Main checking account',
      tags: ['finance', 'important', 'banking'],
    };
  }

  /**
   * Creates a request without optional URL.
   */
  public static withoutUrl(): CreatePasswordEntryRequest {
    return {
      userId: faker.string.uuid(),
      siteName: 'Some App',
      username: faker.internet.username(),
      password: faker.internet.password({ length: 16 }),
      category: CategoryType.OTHER,
    };
  }

  /**
   * Creates a request without optional notes.
   */
  public static withoutNotes(): CreatePasswordEntryRequest {
    return {
      userId: faker.string.uuid(),
      siteName: faker.company.name(),
      siteUrl: faker.internet.url(),
      username: faker.internet.username(),
      password: faker.internet.password({ length: 16 }),
      category: CategoryType.PERSONAL,
    };
  }

  /**
   * Creates a request without optional tags.
   */
  public static withoutTags(): CreatePasswordEntryRequest {
    return {
      userId: faker.string.uuid(),
      siteName: faker.company.name(),
      username: faker.internet.username(),
      password: faker.internet.password({ length: 16 }),
      category: CategoryType.PERSONAL,
    };
  }

  /**
   * Creates a request with empty tags array.
   */
  public static withEmptyTags(): CreatePasswordEntryRequest {
    return {
      userId: faker.string.uuid(),
      siteName: faker.company.name(),
      username: faker.internet.username(),
      password: faker.internet.password({ length: 16 }),
      category: CategoryType.PERSONAL,
      tags: [],
    };
  }

  /**
   * Creates a request with many tags.
   */
  public static withManyTags(): CreatePasswordEntryRequest {
    return {
      userId: faker.string.uuid(),
      siteName: faker.company.name(),
      username: faker.internet.username(),
      password: faker.internet.password({ length: 16 }),
      category: CategoryType.WORK,
      tags: ['important', 'work', 'urgent', 'client', 'project-alpha'],
    };
  }

  /**
   * Creates a request with long notes (but valid).
   */
  public static withLongNotes(): CreatePasswordEntryRequest {
    return {
      userId: faker.string.uuid(),
      siteName: faker.company.name(),
      username: faker.internet.username(),
      password: faker.internet.password({ length: 16 }),
      category: CategoryType.PERSONAL,
      notes: 'a'.repeat(999), // Max is 1000
    };
  }

  // Helper methods

  private static randomCategory(): string {
    const categories = Object.values(CategoryType);
    return categories[Math.floor(Math.random() * categories.length)];
  }

  private static randomTags(): string[] {
    const allTags = ['important', 'work', 'personal', 'urgent', 'backup'];
    const count = Math.floor(Math.random() * 3) + 1;
    return allTags.slice(0, count);
  }
}
