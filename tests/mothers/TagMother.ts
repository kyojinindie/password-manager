import { faker } from '@faker-js/faker';
import { Tag } from '../../src/Contexts/PasswordVault/Passwords/domain/Tag';

export class TagMother {
  public static create(value: string): Tag {
    return new Tag(value);
  }

  public static random(): Tag {
    const word = faker.word
      .noun()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-');
    return new Tag(word.substring(0, 15));
  }

  public static withValue(value: string): Tag {
    return new Tag(value);
  }

  public static important(): Tag {
    return new Tag('important');
  }

  public static work(): Tag {
    return new Tag('work');
  }

  public static personal(): Tag {
    return new Tag('personal');
  }

  public static withHyphen(): Tag {
    return new Tag('two-words');
  }

  public static withUnderscore(): Tag {
    return new Tag('two_words');
  }

  public static withNumbers(): Tag {
    return new Tag('tag123');
  }

  public static maxLength(): Tag {
    return new Tag('a'.repeat(30));
  }

  public static uppercase(): string {
    return 'UPPERCASE';
  }

  public static mixedCase(): string {
    return 'MixedCase';
  }

  public static withSpaces(): string {
    return 'with spaces';
  }

  public static invalidEmpty(): string {
    return '';
  }

  public static invalidBlank(): string {
    return '   ';
  }

  public static invalidTooLong(): string {
    return 'a'.repeat(31);
  }

  public static invalidWithSpaces(): string {
    return 'has spaces';
  }

  public static invalidSpecialChars(): string {
    return 'tag@#$%';
  }

  public static invalidNull(): any {
    return null;
  }

  public static invalidUndefined(): any {
    return undefined;
  }
}
