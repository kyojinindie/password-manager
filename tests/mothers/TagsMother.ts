import { Tags } from '../../src/Contexts/PasswordVault/Passwords/domain/Tags';
import { Tag } from '../../src/Contexts/PasswordVault/Passwords/domain/Tag';
// @ts-ignore
import { TagMother } from './TagMother';

export class TagsMother {
  public static create(tags: Tag[]): Tags {
    return new Tags(tags);
  }

  public static random(): Tags {
    const count = Math.floor(Math.random() * 5) + 1;
    const tags = Array.from({ length: count }, () => TagMother.random());
    return new Tags(tags);
  }

  public static empty(): Tags {
    return Tags.empty();
  }

  public static fromStrings(values: string[]): Tags {
    return Tags.fromStrings(values);
  }

  public static single(): Tags {
    return new Tags([TagMother.important()]);
  }

  public static multiple(): Tags {
    return new Tags([TagMother.important(), TagMother.work(), TagMother.personal()]);
  }

  public static withDuplicates(): Tags {
    return new Tags([
      TagMother.work(),
      TagMother.important(),
      TagMother.work(), // Duplicate
    ]);
  }

  public static workAndPersonal(): Tags {
    return new Tags([TagMother.work(), TagMother.personal()]);
  }

  public static onlyWork(): Tags {
    return new Tags([TagMother.work()]);
  }

  public static manyTags(): Tags {
    return new Tags([
      TagMother.important(),
      TagMother.work(),
      TagMother.personal(),
      TagMother.withHyphen(),
      TagMother.withUnderscore(),
    ]);
  }

  public static fromStringArray(values: string[]): Tags {
    return Tags.fromStrings(values);
  }
}
