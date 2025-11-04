import { faker } from '@faker-js/faker';
import { Notes } from '../../src/Contexts/PasswordVault/Passwords/domain/Notes';

export class NotesMother {
  public static create(value: string | null): Notes {
    return new Notes(value);
  }

  public static random(): Notes {
    return new Notes(faker.lorem.paragraph());
  }

  public static empty(): Notes {
    return Notes.empty();
  }

  public static withValue(value: string): Notes {
    return new Notes(value);
  }

  public static short(): Notes {
    return new Notes('This is a short note');
  }

  public static long(): Notes {
    return new Notes(faker.lorem.paragraphs(5));
  }

  public static maxLength(): Notes {
    return new Notes('a'.repeat(1000));
  }

  public static withSpaces(): Notes {
    return new Notes('  Some notes with spaces  ');
  }

  public static withNewlines(): Notes {
    return new Notes('Line 1\nLine 2\nLine 3');
  }

  public static emptyString(): Notes {
    return new Notes('');
  }

  public static blankString(): Notes {
    return new Notes('   ');
  }

  public static nullValue(): Notes {
    return new Notes(null);
  }

  public static invalidTooLong(): string {
    return 'a'.repeat(1001);
  }
}
