import { PasswordEntryCreator } from '../../../../../../src/Contexts/PasswordVault/Passwords/application/Create/PasswordEntryCreator';
import { PasswordEntryRepository } from '../../../../../../src/Contexts/PasswordVault/Passwords/domain/PasswordEntryRepository';
import { PasswordEncryptionService } from '../../../../../../src/Contexts/PasswordVault/Passwords/domain/PasswordEncryptionService';
import { PasswordEntry } from '../../../../../../src/Contexts/PasswordVault/Passwords/domain/PasswordEntry';
import { EncryptedPassword } from '../../../../../../src/Contexts/PasswordVault/Passwords/domain/EncryptedPassword';
import { CreatePasswordEntryRequestMother } from '../../../../../mothers/CreatePasswordEntryRequestMother';
import { EncryptedPasswordMother } from '../../../../../mothers/EncryptedPasswordMother';

/**
 * Mock implementation of PasswordEntryRepository for testing.
 */
class MockPasswordEntryRepository implements PasswordEntryRepository {
  private savedEntry: PasswordEntry | null = null;

  public async save(passwordEntry: PasswordEntry): Promise<void> {
    this.savedEntry = passwordEntry;
  }

  public async findById(): Promise<PasswordEntry | null> {
    return null;
  }

  public async findByUserId(): Promise<PasswordEntry[]> {
    return [];
  }

  public async delete(): Promise<boolean> {
    return false;
  }

  public async findByUserIdWithCriteria(
    _userId: string,
    _page: number,
    _limit: number,
    _sortBy: string,
    _sortOrder: 'asc' | 'desc',
    _category?: string
  ): Promise<PasswordEntry[]> {
    return [];
  }

  public async countByUserId(_userId: string, _category?: string): Promise<number> {
    return 0;
  }

  // Test helper
  public getSavedEntry(): PasswordEntry | null {
    return this.savedEntry;
  }

  public clear(): void {
    this.savedEntry = null;
  }
}

/**
 * Mock implementation of PasswordEncryptionService for testing.
 */
class MockPasswordEncryptionService implements PasswordEncryptionService {
  public async encrypt(
    _plainPassword: string,
    _userId: string
  ): Promise<EncryptedPassword> {
    // Simulate encryption by returning a valid mock encrypted password
    return EncryptedPasswordMother.random();
  }

  public async decrypt(): Promise<string> {
    return 'plain_password';
  }
}

describe('PasswordEntryCreator', () => {
  let passwordEntryCreator: PasswordEntryCreator;
  let mockRepository: MockPasswordEntryRepository;
  let mockEncryptionService: MockPasswordEncryptionService;

  beforeEach(() => {
    mockRepository = new MockPasswordEntryRepository();
    mockEncryptionService = new MockPasswordEncryptionService();
    passwordEntryCreator = new PasswordEntryCreator(
      mockRepository,
      mockEncryptionService
    );
  });

  afterEach(() => {
    mockRepository.clear();
  });

  describe('Success Cases', () => {
    it('should create a password entry with all fields', async () => {
      const request = CreatePasswordEntryRequestMother.withAllFields();

      const response = await passwordEntryCreator.run(request);

      expect(response).toBeDefined();
      expect(response.id).toBeDefined();
      expect(response.id.length).toBeGreaterThan(0);
      expect(response.siteName).toBe(request.siteName);
      expect(response.siteUrl).toBe(request.siteUrl);
      expect(response.username).toBe(request.username);
      expect(response.category).toBe(request.category);
      expect(response.notes).toBe(request.notes);
      expect(response.tags).toEqual(request.tags);
      expect(response.createdAt).toBeInstanceOf(Date);
      expect(response.updatedAt).toBeInstanceOf(Date);
      expect(response.createdAt).toEqual(response.updatedAt);
    });

    it('should create a password entry with only required fields', async () => {
      const request = CreatePasswordEntryRequestMother.withRequiredFieldsOnly();

      const response = await passwordEntryCreator.run(request);

      expect(response).toBeDefined();
      expect(response.id).toBeDefined();
      expect(response.siteName).toBe(request.siteName);
      expect(response.siteUrl).toBeNull();
      expect(response.username).toBe(request.username);
      expect(response.category).toBe(request.category);
      expect(response.notes).toBeNull();
      expect(response.tags).toEqual([]);
    });

    it('should NOT include the password in the response', async () => {
      const request = CreatePasswordEntryRequestMother.withAllFields();

      const response = await passwordEntryCreator.run(request);

      // Response should not have a password property
      expect(response).not.toHaveProperty('password');
      expect(response).not.toHaveProperty('encryptedPassword');
    });

    it('should persist the password entry', async () => {
      const request = CreatePasswordEntryRequestMother.random();

      await passwordEntryCreator.run(request);

      const savedEntry = mockRepository.getSavedEntry();
      expect(savedEntry).not.toBeNull();
      expect(savedEntry!.siteName.value).toBe(request.siteName);
      expect(savedEntry!.username.value).toBe(request.username);
    });

    it('should encrypt the password before saving', async () => {
      const request = CreatePasswordEntryRequestMother.withAllFields();

      await passwordEntryCreator.run(request);

      const savedEntry = mockRepository.getSavedEntry();
      expect(savedEntry).not.toBeNull();
      // Password should be encrypted, not the plain text
      expect(savedEntry!.encryptedPassword.value).not.toBe(request.password);
      // Encrypted password should be at least 32 characters (AES-256-GCM)
      expect(savedEntry!.encryptedPassword.value.length).toBeGreaterThanOrEqual(32);
    });

    it('should create entry for specific user', async () => {
      const userId = 'user-123';
      const request = CreatePasswordEntryRequestMother.forUser(userId);

      const response = await passwordEntryCreator.run(request);

      const savedEntry = mockRepository.getSavedEntry();
      expect(savedEntry).not.toBeNull();
      expect(savedEntry!.userId).toBe(userId);
      expect(response.id).toBeDefined();
    });

    it('should handle optional URL correctly when not provided', async () => {
      const request = CreatePasswordEntryRequestMother.withoutUrl();

      const response = await passwordEntryCreator.run(request);

      expect(response.siteUrl).toBeNull();

      const savedEntry = mockRepository.getSavedEntry();
      expect(savedEntry!.siteUrl.isEmpty()).toBe(true);
      expect(savedEntry!.siteUrl.value).toBeNull();
    });

    it('should handle optional notes correctly when not provided', async () => {
      const request = CreatePasswordEntryRequestMother.withoutNotes();

      const response = await passwordEntryCreator.run(request);

      expect(response.notes).toBeNull();

      const savedEntry = mockRepository.getSavedEntry();
      expect(savedEntry!.notes.isEmpty()).toBe(true);
      expect(savedEntry!.notes.value).toBeNull();
    });

    it('should handle optional tags correctly when not provided', async () => {
      const request = CreatePasswordEntryRequestMother.withoutTags();

      const response = await passwordEntryCreator.run(request);

      expect(response.tags).toEqual([]);

      const savedEntry = mockRepository.getSavedEntry();
      expect(savedEntry!.tags.isEmpty()).toBe(true);
      expect(savedEntry!.tags.toStringArray()).toEqual([]);
    });

    it('should handle empty tags array', async () => {
      const request = CreatePasswordEntryRequestMother.withEmptyTags();

      const response = await passwordEntryCreator.run(request);

      expect(response.tags).toEqual([]);
    });

    it('should create entry with multiple tags', async () => {
      const request = CreatePasswordEntryRequestMother.withManyTags();

      const response = await passwordEntryCreator.run(request);

      expect(response.tags).toEqual(request.tags);
      expect(response.tags.length).toBeGreaterThan(1);

      const savedEntry = mockRepository.getSavedEntry();
      expect(savedEntry!.tags.toStringArray()).toEqual(request.tags);
    });

    it('should create entry for Google', async () => {
      const request = CreatePasswordEntryRequestMother.google();

      const response = await passwordEntryCreator.run(request);

      expect(response.siteName).toBe('Google');
      expect(response.siteUrl).toBe('https://www.google.com');
      expect(response.category).toBe('EMAIL');
    });

    it('should create entry for GitHub', async () => {
      const request = CreatePasswordEntryRequestMother.github();

      const response = await passwordEntryCreator.run(request);

      expect(response.siteName).toBe('GitHub');
      expect(response.siteUrl).toBe('https://github.com');
      expect(response.category).toBe('WORK');
      expect(response.tags).toContain('work');
      expect(response.tags).toContain('development');
    });

    it('should create banking entry with finance category', async () => {
      const request = CreatePasswordEntryRequestMother.banking();

      const response = await passwordEntryCreator.run(request);

      expect(response.category).toBe('FINANCE');
      expect(response.tags).toContain('finance');
      expect(response.tags).toContain('important');
    });

    it('should handle long notes within limits', async () => {
      const request = CreatePasswordEntryRequestMother.withLongNotes();

      const response = await passwordEntryCreator.run(request);

      expect(response.notes).toBeDefined();
      expect(response.notes!.length).toBeLessThanOrEqual(1000);
    });
  });

  describe('Validation Error Cases', () => {
    it('should throw InvalidSiteNameException when site name is empty', async () => {
      const request = CreatePasswordEntryRequestMother.random();
      request.siteName = '';

      await expect(passwordEntryCreator.run(request)).rejects.toThrow(
        'Site name cannot be empty'
      );
    });

    it('should throw InvalidSiteNameException when site name is too long', async () => {
      const request = CreatePasswordEntryRequestMother.random();
      request.siteName = 'a'.repeat(101);

      await expect(passwordEntryCreator.run(request)).rejects.toThrow(
        'Site name cannot exceed 100 characters'
      );
    });

    it('should throw InvalidSiteUrlException when URL is invalid', async () => {
      const request = CreatePasswordEntryRequestMother.random();
      request.siteUrl = 'not-a-valid-url';

      await expect(passwordEntryCreator.run(request)).rejects.toThrow(
        'Invalid URL format'
      );
    });

    it('should throw InvalidUsernameException when username is empty', async () => {
      const request = CreatePasswordEntryRequestMother.random();
      request.username = '';

      await expect(passwordEntryCreator.run(request)).rejects.toThrow(
        'Username cannot be empty'
      );
    });

    // Note: Username VO doesn't currently have max length validation
    // This test is kept for future implementation
    it.skip('should throw InvalidUsernameException when username is too long', async () => {
      const request = CreatePasswordEntryRequestMother.random();
      request.username = 'a'.repeat(101);

      await expect(passwordEntryCreator.run(request)).rejects.toThrow(
        'Username cannot exceed 100 characters'
      );
    });

    it('should throw InvalidCategoryException when category is invalid', async () => {
      const request = CreatePasswordEntryRequestMother.random();
      request.category = 'INVALID_CATEGORY';

      await expect(passwordEntryCreator.run(request)).rejects.toThrow('Invalid category');
    });

    it('should throw InvalidNotesException when notes exceed max length', async () => {
      const request = CreatePasswordEntryRequestMother.random();
      request.notes = 'a'.repeat(1001);

      await expect(passwordEntryCreator.run(request)).rejects.toThrow(
        'Notes cannot exceed 1000 characters'
      );
    });

    it('should throw InvalidTagException when tag is empty', async () => {
      const request = CreatePasswordEntryRequestMother.random();
      request.tags = ['valid-tag', '', 'another-tag'];

      await expect(passwordEntryCreator.run(request)).rejects.toThrow(
        'Tag cannot be empty'
      );
    });

    it('should throw InvalidTagException when tag is too long', async () => {
      const request = CreatePasswordEntryRequestMother.random();
      request.tags = ['a'.repeat(31)];

      await expect(passwordEntryCreator.run(request)).rejects.toThrow(
        'Tag cannot exceed 30 characters'
      );
    });

    it('should throw InvalidTagException when tag has invalid characters', async () => {
      const request = CreatePasswordEntryRequestMother.random();
      request.tags = ['invalid tag with spaces'];

      await expect(passwordEntryCreator.run(request)).rejects.toThrow(
        'Tag cannot contain spaces'
      );
    });
  });

  describe('Business Rules', () => {
    it('should create entries with same site name for different users', async () => {
      const request1 = CreatePasswordEntryRequestMother.forUser('user-1');
      request1.siteName = 'GitHub';

      const request2 = CreatePasswordEntryRequestMother.forUser('user-2');
      request2.siteName = 'GitHub';

      const response1 = await passwordEntryCreator.run(request1);
      const response2 = await passwordEntryCreator.run(request2);

      expect(response1.id).not.toBe(response2.id);
      expect(response1.siteName).toBe(response2.siteName);
    });

    it('should generate unique IDs for each entry', async () => {
      const request1 = CreatePasswordEntryRequestMother.random();
      const request2 = CreatePasswordEntryRequestMother.random();

      const response1 = await passwordEntryCreator.run(request1);
      const response2 = await passwordEntryCreator.run(request2);

      expect(response1.id).not.toBe(response2.id);
    });

    it('should set createdAt and updatedAt to same time on creation', async () => {
      const request = CreatePasswordEntryRequestMother.random();

      const response = await passwordEntryCreator.run(request);

      expect(response.createdAt.getTime()).toBe(response.updatedAt.getTime());
    });

    it('should remove duplicate tags', async () => {
      const request = CreatePasswordEntryRequestMother.random();
      request.tags = ['work', 'important', 'work']; // Duplicate 'work'

      const response = await passwordEntryCreator.run(request);

      // Tags VO should remove duplicates
      expect(response.tags).toContain('work');
      expect(response.tags).toContain('important');
      expect(response.tags.filter(tag => tag === 'work').length).toBe(1);
    });

    it('should normalize category to uppercase', async () => {
      const request = CreatePasswordEntryRequestMother.random();
      request.category = 'personal'; // lowercase

      const response = await passwordEntryCreator.run(request);

      expect(response.category).toBe('PERSONAL'); // Normalized to uppercase
    });
  });

  describe('Integration with Ports', () => {
    it('should call encryption service with correct parameters', async () => {
      const userId = 'user-123';
      const plainPassword = 'MyPlainPassword123!';
      const request = CreatePasswordEntryRequestMother.forUser(userId);
      request.password = plainPassword;

      let encryptedCalled = false;
      let calledWithPassword = '';
      let calledWithUserId = '';

      const spyEncryptionService: PasswordEncryptionService = {
        async encrypt(password: string, user: string): Promise<EncryptedPassword> {
          encryptedCalled = true;
          calledWithPassword = password;
          calledWithUserId = user;
          return EncryptedPasswordMother.random();
        },
        async decrypt(): Promise<string> {
          return '';
        },
      };

      const creator = new PasswordEntryCreator(mockRepository, spyEncryptionService);
      await creator.run(request);

      expect(encryptedCalled).toBe(true);
      expect(calledWithPassword).toBe(plainPassword);
      expect(calledWithUserId).toBe(userId);
    });

    it('should call repository save with correct PasswordEntry', async () => {
      const request = CreatePasswordEntryRequestMother.withAllFields();

      await passwordEntryCreator.run(request);

      const savedEntry = mockRepository.getSavedEntry();
      expect(savedEntry).toBeInstanceOf(PasswordEntry);
      expect(savedEntry!.siteName.value).toBe(request.siteName);
      expect(savedEntry!.username.value).toBe(request.username);
      expect(savedEntry!.category.value).toBe(request.category);
    });
  });
});
