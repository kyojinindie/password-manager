import { faker } from '@faker-js/faker';
import { PasswordEntry } from '../../src/Contexts/PasswordVault/Passwords/domain/PasswordEntry';
import { PasswordEntryId } from '../../src/Contexts/PasswordVault/Passwords/domain/PasswordEntryId';
import { SiteName } from '../../src/Contexts/PasswordVault/Passwords/domain/SiteName';
import { SiteUrl } from '../../src/Contexts/PasswordVault/Passwords/domain/SiteUrl';
import { Username } from '../../src/Contexts/PasswordVault/Passwords/domain/Username';
import { EncryptedPassword } from '../../src/Contexts/PasswordVault/Passwords/domain/EncryptedPassword';
import { Category } from '../../src/Contexts/PasswordVault/Passwords/domain/Category';
import { Notes } from '../../src/Contexts/PasswordVault/Passwords/domain/Notes';
import { Tags } from '../../src/Contexts/PasswordVault/Passwords/domain/Tags';
import { CreatedAt } from '../../src/Contexts/PasswordVault/Passwords/domain/CreatedAt';
import { UpdatedAt } from '../../src/Contexts/PasswordVault/Passwords/domain/UpdatedAt';
import { PasswordEntryIdMother } from './PasswordEntryIdMother';
import { SiteNameMother } from './SiteNameMother';
import { SiteUrlMother } from './SiteUrlMother';
import { PasswordUsernameMother } from './PasswordUsernameMothor';
import { EncryptedPasswordMother } from './EncryptedPasswordMother';
import { CategoryMother } from './CategoryMother';
import { NotesMother } from './NotesMother';
import { TagsMother } from './TagsMother';
import { PasswordCreatedAtMother } from './PasswordCreatedAtMother';
import { PasswordUpdatedAtMother } from './PasswordUpdatedAtMother';

export class PasswordEntryMother {
  public static create(params?: {
    id?: PasswordEntryId;
    userId?: string;
    siteName?: SiteName;
    siteUrl?: SiteUrl;
    username?: Username;
    encryptedPassword?: EncryptedPassword;
    category?: Category;
    notes?: Notes;
    tags?: Tags;
    createdAt?: CreatedAt;
    updatedAt?: UpdatedAt;
  }): PasswordEntry {
    const id = params?.id ?? PasswordEntryIdMother.random();
    const userId = params?.userId ?? faker.string.uuid();
    const siteName = params?.siteName ?? SiteNameMother.random();
    const siteUrl = params?.siteUrl ?? SiteUrlMother.random();
    const username = params?.username ?? PasswordUsernameMother.random();
    const encryptedPassword =
      params?.encryptedPassword ?? EncryptedPasswordMother.random();
    const category = params?.category ?? CategoryMother.random();
    const notes = params?.notes ?? NotesMother.random();
    const tags = params?.tags ?? TagsMother.random();
    const createdAt = params?.createdAt ?? PasswordCreatedAtMother.now();
    const updatedAt = params?.updatedAt ?? PasswordUpdatedAtMother.now();

    return new PasswordEntry(
      id,
      userId,
      siteName,
      siteUrl,
      username,
      encryptedPassword,
      category,
      notes,
      tags,
      createdAt,
      updatedAt
    );
  }

  public static random(): PasswordEntry {
    return this.create();
  }

  public static forUser(userId: string): PasswordEntry {
    return this.create({ userId });
  }

  public static googleEntry(userId?: string): PasswordEntry {
    return this.create({
      userId: userId ?? faker.string.uuid(),
      siteName: SiteNameMother.google(),
      siteUrl: SiteUrlMother.google(),
      category: CategoryMother.email(),
      tags: TagsMother.fromStrings(['important', 'email']),
    });
  }

  public static githubEntry(userId?: string): PasswordEntry {
    return this.create({
      userId: userId ?? faker.string.uuid(),
      siteName: SiteNameMother.github(),
      siteUrl: SiteUrlMother.github(),
      category: CategoryMother.work(),
      tags: TagsMother.fromStrings(['work', 'development']),
    });
  }

  public static withCategory(category: Category, userId?: string): PasswordEntry {
    return this.create({
      userId: userId ?? faker.string.uuid(),
      category,
    });
  }

  public static withTags(tags: Tags, userId?: string): PasswordEntry {
    return this.create({
      userId: userId ?? faker.string.uuid(),
      tags,
    });
  }

  public static withNotes(notes: Notes, userId?: string): PasswordEntry {
    return this.create({
      userId: userId ?? faker.string.uuid(),
      notes,
    });
  }

  public static withoutUrl(userId?: string): PasswordEntry {
    return this.create({
      userId: userId ?? faker.string.uuid(),
      siteUrl: SiteUrlMother.empty(),
    });
  }

  public static withoutNotes(userId?: string): PasswordEntry {
    return this.create({
      userId: userId ?? faker.string.uuid(),
      notes: NotesMother.empty(),
    });
  }

  public static withoutTags(userId?: string): PasswordEntry {
    return this.create({
      userId: userId ?? faker.string.uuid(),
      tags: TagsMother.empty(),
    });
  }

  public static minimal(userId?: string): PasswordEntry {
    return this.create({
      userId: userId ?? faker.string.uuid(),
      siteUrl: SiteUrlMother.empty(),
      notes: NotesMother.empty(),
      tags: TagsMother.empty(),
    });
  }

  public static complete(userId?: string): PasswordEntry {
    return this.create({
      userId: userId ?? faker.string.uuid(),
      siteName: SiteNameMother.google(),
      siteUrl: SiteUrlMother.google(),
      username: PasswordUsernameMother.email(),
      encryptedPassword: EncryptedPasswordMother.validEncrypted(),
      category: CategoryMother.personal(),
      notes: NotesMother.long(),
      tags: TagsMother.multiple(),
    });
  }

  public static createNew(params: {
    userId: string;
    siteName: SiteName;
    username: Username;
    encryptedPassword: EncryptedPassword;
    category: Category;
    siteUrl?: SiteUrl;
    notes?: Notes;
    tags?: Tags;
  }): PasswordEntry {
    return PasswordEntry.create(
      params.userId,
      params.siteName,
      params.username,
      params.encryptedPassword,
      params.category,
      params.siteUrl,
      params.notes,
      params.tags
    );
  }

  public static createdYesterday(userId?: string): PasswordEntry {
    const yesterday = PasswordCreatedAtMother.yesterday();
    return this.create({
      userId: userId ?? faker.string.uuid(),
      createdAt: yesterday,
      updatedAt: PasswordUpdatedAtMother.afterCreatedAt(yesterday.value),
    });
  }

  public static createdLastWeek(userId?: string): PasswordEntry {
    const lastWeek = PasswordCreatedAtMother.lastWeek();
    return this.create({
      userId: userId ?? faker.string.uuid(),
      createdAt: lastWeek,
      updatedAt: PasswordUpdatedAtMother.afterCreatedAt(lastWeek.value),
    });
  }
}
