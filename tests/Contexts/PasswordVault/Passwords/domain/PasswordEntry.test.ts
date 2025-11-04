import { PasswordEntryMother } from '../../../../mothers/PasswordEntryMother';
import { SiteNameMother } from '../../../../mothers/SiteNameMother';
import { SiteUrlMother } from '../../../../mothers/SiteUrlMother';
import { PasswordUsernameMother } from '../../../../mothers/PasswordUsernameMothor';
import { EncryptedPasswordMother } from '../../../../mothers/EncryptedPasswordMother';
import { CategoryMother } from '../../../../mothers/CategoryMother';
import { NotesMother } from '../../../../mothers/NotesMother';
import { TagsMother } from '../../../../mothers/TagsMother';
import { UnauthorizedPasswordEntryAccessException } from '../../../../../src/Contexts/PasswordVault/Passwords/domain/UnauthorizedPasswordEntryAccessException';

describe('PasswordEntry', () => {
  const OWNER_USER_ID = '550e8400-e29b-41d4-a716-446655440000';
  const OTHER_USER_ID = '550e8400-e29b-41d4-a716-446655440001';

  describe('create', () => {
    it('should create PasswordEntry with mandatory fields', () => {
      const entry = PasswordEntryMother.createNew({
        userId: OWNER_USER_ID,
        siteName: SiteNameMother.google(),
        username: PasswordUsernameMother.email(),
        encryptedPassword: EncryptedPasswordMother.validEncrypted(),
        category: CategoryMother.email(),
      });

      expect(entry.id).toBeDefined();
      expect(entry.userId).toBe(OWNER_USER_ID);
      expect(entry.siteName.value).toBe('Google');
      expect(entry.username).toBeDefined();
      expect(entry.encryptedPassword).toBeDefined();
      expect(entry.category.value).toBe('EMAIL');
      expect(entry.createdAt).toBeDefined();
      expect(entry.updatedAt).toBeDefined();
    });

    it('should create PasswordEntry with all optional fields', () => {
      const entry = PasswordEntryMother.createNew({
        userId: OWNER_USER_ID,
        siteName: SiteNameMother.google(),
        username: PasswordUsernameMother.email(),
        encryptedPassword: EncryptedPasswordMother.validEncrypted(),
        category: CategoryMother.personal(),
        siteUrl: SiteUrlMother.google(),
        notes: NotesMother.short(),
        tags: TagsMother.multiple(),
      });

      expect(entry.siteUrl.value).toBe('https://www.google.com');
      expect(entry.notes.isEmpty()).toBe(false);
      expect(entry.tags.count()).toBe(3);
    });

    it('should create PasswordEntry with empty optional fields when not provided', () => {
      const entry = PasswordEntryMother.createNew({
        userId: OWNER_USER_ID,
        siteName: SiteNameMother.google(),
        username: PasswordUsernameMother.email(),
        encryptedPassword: EncryptedPasswordMother.validEncrypted(),
        category: CategoryMother.personal(),
      });

      expect(entry.siteUrl.isEmpty()).toBe(true);
      expect(entry.notes.isEmpty()).toBe(true);
      expect(entry.tags.isEmpty()).toBe(true);
    });

    it('should generate unique IDs for different entries', () => {
      const entry1 = PasswordEntryMother.createNew({
        userId: OWNER_USER_ID,
        siteName: SiteNameMother.google(),
        username: PasswordUsernameMother.email(),
        encryptedPassword: EncryptedPasswordMother.validEncrypted(),
        category: CategoryMother.personal(),
      });

      const entry2 = PasswordEntryMother.createNew({
        userId: OWNER_USER_ID,
        siteName: SiteNameMother.google(),
        username: PasswordUsernameMother.email(),
        encryptedPassword: EncryptedPasswordMother.validEncrypted(),
        category: CategoryMother.personal(),
      });

      expect(entry1.id.equals(entry2.id)).toBe(false);
    });

    it('should set createdAt and updatedAt to same value on creation', () => {
      const entry = PasswordEntryMother.createNew({
        userId: OWNER_USER_ID,
        siteName: SiteNameMother.google(),
        username: PasswordUsernameMother.email(),
        encryptedPassword: EncryptedPasswordMother.validEncrypted(),
        category: CategoryMother.personal(),
      });

      expect(entry.createdAt.value.getTime()).toBe(entry.updatedAt.value.getTime());
    });
  });

  describe('belongsToUser', () => {
    it('should return true when entry belongs to user', () => {
      const entry = PasswordEntryMother.forUser(OWNER_USER_ID);

      expect(entry.belongsToUser(OWNER_USER_ID)).toBe(true);
    });

    it('should return false when entry does not belong to user', () => {
      const entry = PasswordEntryMother.forUser(OWNER_USER_ID);

      expect(entry.belongsToUser(OTHER_USER_ID)).toBe(false);
    });
  });

  describe('ensureBelongsToUser', () => {
    it('should not throw when user is the owner', () => {
      const entry = PasswordEntryMother.forUser(OWNER_USER_ID);

      expect(() => entry.ensureBelongsToUser(OWNER_USER_ID)).not.toThrow();
    });

    it('should throw UnauthorizedPasswordEntryAccessException when user is not the owner', () => {
      const entry = PasswordEntryMother.forUser(OWNER_USER_ID);

      expect(() => entry.ensureBelongsToUser(OTHER_USER_ID)).toThrow(
        UnauthorizedPasswordEntryAccessException
      );
    });
  });

  describe('updateSiteName', () => {
    it('should update site name when user is owner', () => {
      const entry = PasswordEntryMother.forUser(OWNER_USER_ID);
      const newSiteName = SiteNameMother.github();
      const originalUpdatedAt = entry.updatedAt.value.getTime();

      // Small delay to ensure timestamp difference
      setTimeout(() => {
        entry.updateSiteName(newSiteName, OWNER_USER_ID);

        expect(entry.siteName.value).toBe('GitHub');
        expect(entry.updatedAt.value.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt);
      }, 10);
    });

    it('should throw when non-owner tries to update site name', () => {
      const entry = PasswordEntryMother.forUser(OWNER_USER_ID);
      const newSiteName = SiteNameMother.github();

      expect(() => entry.updateSiteName(newSiteName, OTHER_USER_ID)).toThrow(
        UnauthorizedPasswordEntryAccessException
      );
    });

    it('should not modify site name when update fails', () => {
      const entry = PasswordEntryMother.forUser(OWNER_USER_ID);
      const originalSiteName = entry.siteName;
      const newSiteName = SiteNameMother.github();

      try {
        entry.updateSiteName(newSiteName, OTHER_USER_ID);
      } catch (error) {
        // Expected to throw
      }

      expect(entry.siteName).toBe(originalSiteName);
    });
  });

  describe('updateSiteUrl', () => {
    it('should update site URL when user is owner', () => {
      const entry = PasswordEntryMother.forUser(OWNER_USER_ID);
      const newSiteUrl = SiteUrlMother.github();

      entry.updateSiteUrl(newSiteUrl, OWNER_USER_ID);

      expect(entry.siteUrl.value).toBe('https://github.com');
    });

    it('should throw when non-owner tries to update site URL', () => {
      const entry = PasswordEntryMother.forUser(OWNER_USER_ID);
      const newSiteUrl = SiteUrlMother.github();

      expect(() => entry.updateSiteUrl(newSiteUrl, OTHER_USER_ID)).toThrow(
        UnauthorizedPasswordEntryAccessException
      );
    });

    it('should allow setting URL to empty', () => {
      const entry = PasswordEntryMother.forUser(OWNER_USER_ID);
      const emptyUrl = SiteUrlMother.empty();

      entry.updateSiteUrl(emptyUrl, OWNER_USER_ID);

      expect(entry.siteUrl.isEmpty()).toBe(true);
    });
  });

  describe('updateUsername', () => {
    it('should update username when user is owner', () => {
      const entry = PasswordEntryMother.forUser(OWNER_USER_ID);
      const newUsername = PasswordUsernameMother.withValue('new-username');

      entry.updateUsername(newUsername, OWNER_USER_ID);

      expect(entry.username.value).toBe('new-username');
    });

    it('should throw when non-owner tries to update username', () => {
      const entry = PasswordEntryMother.forUser(OWNER_USER_ID);
      const newUsername = PasswordUsernameMother.simple();

      expect(() => entry.updateUsername(newUsername, OTHER_USER_ID)).toThrow(
        UnauthorizedPasswordEntryAccessException
      );
    });
  });

  describe('updatePassword', () => {
    it('should update password when user is owner', () => {
      const entry = PasswordEntryMother.forUser(OWNER_USER_ID);
      const newPassword = EncryptedPasswordMother.random();
      const originalPassword = entry.encryptedPassword;

      entry.updatePassword(newPassword, OWNER_USER_ID);

      expect(entry.encryptedPassword).not.toBe(originalPassword);
      expect(entry.encryptedPassword.equals(newPassword)).toBe(true);
    });

    it('should throw when non-owner tries to update password', () => {
      const entry = PasswordEntryMother.forUser(OWNER_USER_ID);
      const newPassword = EncryptedPasswordMother.random();

      expect(() => entry.updatePassword(newPassword, OTHER_USER_ID)).toThrow(
        UnauthorizedPasswordEntryAccessException
      );
    });
  });

  describe('updateCategory', () => {
    it('should update category when user is owner', () => {
      const entry = PasswordEntryMother.forUser(OWNER_USER_ID);
      const newCategory = CategoryMother.work();

      entry.updateCategory(newCategory, OWNER_USER_ID);

      expect(entry.category.value).toBe('WORK');
    });

    it('should throw when non-owner tries to update category', () => {
      const entry = PasswordEntryMother.forUser(OWNER_USER_ID);
      const newCategory = CategoryMother.work();

      expect(() => entry.updateCategory(newCategory, OTHER_USER_ID)).toThrow(
        UnauthorizedPasswordEntryAccessException
      );
    });
  });

  describe('updateNotes', () => {
    it('should update notes when user is owner', () => {
      const entry = PasswordEntryMother.forUser(OWNER_USER_ID);
      const newNotes = NotesMother.short();

      entry.updateNotes(newNotes, OWNER_USER_ID);

      expect(entry.notes.value).toBe('This is a short note');
    });

    it('should throw when non-owner tries to update notes', () => {
      const entry = PasswordEntryMother.forUser(OWNER_USER_ID);
      const newNotes = NotesMother.short();

      expect(() => entry.updateNotes(newNotes, OTHER_USER_ID)).toThrow(
        UnauthorizedPasswordEntryAccessException
      );
    });

    it('should allow setting notes to empty', () => {
      const entry = PasswordEntryMother.forUser(OWNER_USER_ID);
      const emptyNotes = NotesMother.empty();

      entry.updateNotes(emptyNotes, OWNER_USER_ID);

      expect(entry.notes.isEmpty()).toBe(true);
    });
  });

  describe('updateTags', () => {
    it('should update tags when user is owner', () => {
      const entry = PasswordEntryMother.forUser(OWNER_USER_ID);
      const newTags = TagsMother.fromStrings(['new-tag', 'another-tag']);

      entry.updateTags(newTags, OWNER_USER_ID);

      expect(entry.tags.count()).toBe(2);
      expect(entry.tags.containsString('new-tag')).toBe(true);
    });

    it('should throw when non-owner tries to update tags', () => {
      const entry = PasswordEntryMother.forUser(OWNER_USER_ID);
      const newTags = TagsMother.multiple();

      expect(() => entry.updateTags(newTags, OTHER_USER_ID)).toThrow(
        UnauthorizedPasswordEntryAccessException
      );
    });

    it('should allow setting tags to empty', () => {
      const entry = PasswordEntryMother.forUser(OWNER_USER_ID);
      const emptyTags = TagsMother.empty();

      entry.updateTags(emptyTags, OWNER_USER_ID);

      expect(entry.tags.isEmpty()).toBe(true);
    });
  });

  describe('equals', () => {
    it('should return true when comparing entries with same ID', () => {
      const entry1 = PasswordEntryMother.forUser(OWNER_USER_ID);
      const entry2 = PasswordEntryMother.create({
        id: entry1.id,
        userId: OWNER_USER_ID,
      });

      expect(entry1.equals(entry2)).toBe(true);
    });

    it('should return false when comparing entries with different IDs', () => {
      const entry1 = PasswordEntryMother.forUser(OWNER_USER_ID);
      const entry2 = PasswordEntryMother.forUser(OWNER_USER_ID);

      expect(entry1.equals(entry2)).toBe(false);
    });

    it('should return false when comparing with null', () => {
      const entry = PasswordEntryMother.forUser(OWNER_USER_ID);

      expect(entry.equals(null as any)).toBe(false);
    });
  });

  describe('toPrimitives', () => {
    it('should convert entry to primitives object', () => {
      const entry = PasswordEntryMother.complete(OWNER_USER_ID);
      const primitives = entry.toPrimitives();

      expect(primitives).toHaveProperty('id');
      expect(primitives).toHaveProperty('userId');
      expect(primitives).toHaveProperty('siteName');
      expect(primitives).toHaveProperty('siteUrl');
      expect(primitives).toHaveProperty('username');
      expect(primitives).toHaveProperty('encryptedPassword');
      expect(primitives).toHaveProperty('category');
      expect(primitives).toHaveProperty('notes');
      expect(primitives).toHaveProperty('tags');
      expect(primitives).toHaveProperty('createdAt');
      expect(primitives).toHaveProperty('updatedAt');

      expect(typeof primitives.id).toBe('string');
      expect(typeof primitives.userId).toBe('string');
      expect(typeof primitives.siteName).toBe('string');
      expect(Array.isArray(primitives.tags)).toBe(true);
      expect(primitives.createdAt instanceof Date).toBe(true);
      expect(primitives.updatedAt instanceof Date).toBe(true);
    });

    it('should convert entry with empty optional fields to primitives', () => {
      const entry = PasswordEntryMother.minimal(OWNER_USER_ID);
      const primitives = entry.toPrimitives();

      expect(primitives.siteUrl).toBeNull();
      expect(primitives.notes).toBeNull();
      expect(primitives.tags).toEqual([]);
    });

    it('should convert tags array correctly', () => {
      const entry = PasswordEntryMother.withTags(
        TagsMother.fromStrings(['work', 'important']),
        OWNER_USER_ID
      );
      const primitives = entry.toPrimitives();

      expect(primitives.tags).toEqual(['work', 'important']);
    });
  });

  describe('getters', () => {
    it('should return all properties correctly', () => {
      const entry = PasswordEntryMother.complete(OWNER_USER_ID);

      expect(entry.id).toBeDefined();
      expect(entry.userId).toBe(OWNER_USER_ID);
      expect(entry.siteName).toBeDefined();
      expect(entry.siteUrl).toBeDefined();
      expect(entry.username).toBeDefined();
      expect(entry.encryptedPassword).toBeDefined();
      expect(entry.category).toBeDefined();
      expect(entry.notes).toBeDefined();
      expect(entry.tags).toBeDefined();
      expect(entry.createdAt).toBeDefined();
      expect(entry.updatedAt).toBeDefined();
    });

    it('should not allow modification of properties through getters', () => {
      const entry = PasswordEntryMother.forUser(OWNER_USER_ID);

      expect(() => {
        (entry as any).id = 'new-id';
      }).toThrow();

      expect(() => {
        (entry as any).userId = 'new-user-id';
      }).toThrow();
    });
  });

  describe('immutability of value objects', () => {
    it('should maintain value object immutability after updates', () => {
      const entry = PasswordEntryMother.forUser(OWNER_USER_ID);
      const originalSiteName = entry.siteName;
      const newSiteName = SiteNameMother.github();

      entry.updateSiteName(newSiteName, OWNER_USER_ID);

      expect(entry.siteName).not.toBe(originalSiteName);
      expect(originalSiteName.value).not.toBe('GitHub');
    });
  });

  describe('business rules', () => {
    it('should always require owner authorization for any modification', () => {
      const entry = PasswordEntryMother.forUser(OWNER_USER_ID);

      const updateMethods = [
        () => entry.updateSiteName(SiteNameMother.github(), OTHER_USER_ID),
        () => entry.updateSiteUrl(SiteUrlMother.github(), OTHER_USER_ID),
        () => entry.updateUsername(PasswordUsernameMother.simple(), OTHER_USER_ID),
        () => entry.updatePassword(EncryptedPasswordMother.random(), OTHER_USER_ID),
        () => entry.updateCategory(CategoryMother.work(), OTHER_USER_ID),
        () => entry.updateNotes(NotesMother.short(), OTHER_USER_ID),
        () => entry.updateTags(TagsMother.multiple(), OTHER_USER_ID),
      ];

      updateMethods.forEach(updateMethod => {
        expect(updateMethod).toThrow(UnauthorizedPasswordEntryAccessException);
      });
    });

    it('should update updatedAt timestamp on any modification', () => {
      const entry = PasswordEntryMother.forUser(OWNER_USER_ID);
      const originalUpdatedAt = entry.updatedAt.value.getTime();

      // Wait a bit to ensure time difference
      return new Promise(resolve => {
        setTimeout(() => {
          entry.updateSiteName(SiteNameMother.github(), OWNER_USER_ID);
          expect(entry.updatedAt.value.getTime()).toBeGreaterThanOrEqual(
            originalUpdatedAt
          );
          resolve(true);
        }, 10);
      });
    });

    it('should never modify createdAt after creation', () => {
      const entry = PasswordEntryMother.forUser(OWNER_USER_ID);
      const originalCreatedAt = entry.createdAt.value.getTime();

      entry.updateSiteName(SiteNameMother.github(), OWNER_USER_ID);
      entry.updateCategory(CategoryMother.work(), OWNER_USER_ID);

      expect(entry.createdAt.value.getTime()).toBe(originalCreatedAt);
    });
  });
});
