import { faker } from '@faker-js/faker';
import { CreatePasswordEntryResponse } from '../../src/Contexts/PasswordVault/Passwords/application/Create/CreatePasswordEntryResponse';
import { CategoryType } from '../../src/Contexts/PasswordVault/Passwords/domain/Category';

/**
 * Mother Object for CreatePasswordEntryResponse DTO
 *
 * Provides factory methods to create test data for the application layer response DTO.
 * This is a DTO Mother, so it works with primitives only.
 * Note: Password is NEVER included in the response.
 */
export class CreatePasswordEntryResponseMother {
  /**
   * Creates a response with the specified values.
   */
  public static create(
    id: string,
    siteName: string,
    siteUrl: string | null,
    username: string,
    category: string,
    notes: string | null,
    tags: string[],
    createdAt: Date,
    updatedAt: Date
  ): CreatePasswordEntryResponse {
    return {
      id,
      siteName,
      siteUrl,
      username,
      category,
      notes,
      tags,
      createdAt,
      updatedAt,
    };
  }

  /**
   * Creates a random valid response.
   */
  public static random(): CreatePasswordEntryResponse {
    const now = new Date();
    return {
      id: faker.string.uuid(),
      siteName: faker.company.name(),
      siteUrl: faker.internet.url(),
      username: faker.internet.username(),
      category: this.randomCategory(),
      notes: faker.lorem.sentence(),
      tags: this.randomTags(),
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Creates a response with only required fields (nulls for optionals).
   */
  public static withRequiredFieldsOnly(): CreatePasswordEntryResponse {
    const now = new Date();
    return {
      id: faker.string.uuid(),
      siteName: faker.company.name(),
      siteUrl: null,
      username: faker.internet.username(),
      category: CategoryType.PERSONAL,
      notes: null,
      tags: [],
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Creates a response with all fields populated.
   */
  public static withAllFields(): CreatePasswordEntryResponse {
    const now = new Date();
    return {
      id: faker.string.uuid(),
      siteName: 'GitHub',
      siteUrl: 'https://github.com',
      username: 'johndoe',
      category: CategoryType.WORK,
      notes: 'This is my work GitHub account',
      tags: ['important', 'work', 'development'],
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Creates a response for Google.
   */
  public static google(): CreatePasswordEntryResponse {
    const now = new Date();
    return {
      id: faker.string.uuid(),
      siteName: 'Google',
      siteUrl: 'https://www.google.com',
      username: 'user@gmail.com',
      category: CategoryType.EMAIL,
      notes: null,
      tags: ['email', 'personal'],
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Creates a response for GitHub.
   */
  public static github(): CreatePasswordEntryResponse {
    const now = new Date();
    return {
      id: faker.string.uuid(),
      siteName: 'GitHub',
      siteUrl: 'https://github.com',
      username: 'developer',
      category: CategoryType.WORK,
      notes: 'Development account',
      tags: ['work', 'development'],
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Creates a response with null URL.
   */
  public static withoutUrl(): CreatePasswordEntryResponse {
    const now = new Date();
    return {
      id: faker.string.uuid(),
      siteName: 'Some App',
      siteUrl: null,
      username: faker.internet.username(),
      category: CategoryType.OTHER,
      notes: null,
      tags: [],
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Creates a response with null notes.
   */
  public static withoutNotes(): CreatePasswordEntryResponse {
    const now = new Date();
    return {
      id: faker.string.uuid(),
      siteName: faker.company.name(),
      siteUrl: faker.internet.url(),
      username: faker.internet.username(),
      category: CategoryType.PERSONAL,
      notes: null,
      tags: ['personal'],
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Creates a response with empty tags array.
   */
  public static withoutTags(): CreatePasswordEntryResponse {
    const now = new Date();
    return {
      id: faker.string.uuid(),
      siteName: faker.company.name(),
      siteUrl: faker.internet.url(),
      username: faker.internet.username(),
      category: CategoryType.PERSONAL,
      notes: 'Some notes',
      tags: [],
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Creates a response with many tags.
   */
  public static withManyTags(): CreatePasswordEntryResponse {
    const now = new Date();
    return {
      id: faker.string.uuid(),
      siteName: faker.company.name(),
      siteUrl: faker.internet.url(),
      username: faker.internet.username(),
      category: CategoryType.WORK,
      notes: null,
      tags: ['important', 'work', 'urgent', 'client', 'project-alpha'],
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Creates a response with specific ID (useful for matching in tests).
   */
  public static withId(id: string): CreatePasswordEntryResponse {
    const now = new Date();
    return {
      id,
      siteName: faker.company.name(),
      siteUrl: faker.internet.url(),
      username: faker.internet.username(),
      category: CategoryType.PERSONAL,
      notes: null,
      tags: [],
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Creates a response with specific timestamps.
   */
  public static withTimestamps(
    createdAt: Date,
    updatedAt: Date
  ): CreatePasswordEntryResponse {
    return {
      id: faker.string.uuid(),
      siteName: faker.company.name(),
      siteUrl: faker.internet.url(),
      username: faker.internet.username(),
      category: CategoryType.PERSONAL,
      notes: null,
      tags: [],
      createdAt,
      updatedAt,
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
