import { TagsMother } from '../../../../mothers/TagsMother';
import { TagMother } from '../../../../mothers/TagMother';

describe('Tags', () => {
  describe('constructor', () => {
    it('should create Tags with multiple tags', () => {
      const tags = TagsMother.multiple();

      expect(tags.count()).toBe(3);
      expect(tags.isEmpty()).toBe(false);
    });

    it('should create Tags with single tag', () => {
      const tags = TagsMother.single();

      expect(tags.count()).toBe(1);
      expect(tags.isEmpty()).toBe(false);
    });

    it('should create empty Tags', () => {
      const tags = TagsMother.empty();

      expect(tags.isEmpty()).toBe(true);
      expect(tags.count()).toBe(0);
    });

    it('should remove duplicate tags automatically', () => {
      const tags = TagsMother.withDuplicates();

      // Should only have 2 unique tags (work appears twice)
      expect(tags.count()).toBe(2);
      expect(tags.containsString('work')).toBe(true);
      expect(tags.containsString('important')).toBe(true);
    });
  });

  describe('fromStrings', () => {
    it('should create Tags from string array', () => {
      const tags = TagsMother.fromStrings(['work', 'important', 'urgent']);

      expect(tags.count()).toBe(3);
      expect(tags.containsString('work')).toBe(true);
      expect(tags.containsString('important')).toBe(true);
      expect(tags.containsString('urgent')).toBe(true);
    });

    it('should remove duplicates when creating from strings', () => {
      const tags = TagsMother.fromStrings(['work', 'work', 'important']);

      expect(tags.count()).toBe(2);
      expect(tags.containsString('work')).toBe(true);
      expect(tags.containsString('important')).toBe(true);
    });

    it('should normalize tags when creating from strings', () => {
      const tags = TagsMother.fromStrings(['WORK', 'Important']);

      expect(tags.containsString('work')).toBe(true);
      expect(tags.containsString('important')).toBe(true);
    });
  });

  describe('isEmpty', () => {
    it('should return true when no tags', () => {
      const tags = TagsMother.empty();

      expect(tags.isEmpty()).toBe(true);
    });

    it('should return false when has tags', () => {
      const tags = TagsMother.single();

      expect(tags.isEmpty()).toBe(false);
    });
  });

  describe('count', () => {
    it('should return 0 for empty tags', () => {
      const tags = TagsMother.empty();

      expect(tags.count()).toBe(0);
    });

    it('should return 1 for single tag', () => {
      const tags = TagsMother.single();

      expect(tags.count()).toBe(1);
    });

    it('should return correct count for multiple tags', () => {
      const tags = TagsMother.multiple();

      expect(tags.count()).toBe(3);
    });

    it('should return correct count after removing duplicates', () => {
      const tags = TagsMother.withDuplicates();

      expect(tags.count()).toBe(2);
    });
  });

  describe('contains', () => {
    it('should return true when tag exists', () => {
      const tags = TagsMother.workAndPersonal();
      const workTag = TagMother.work();

      expect(tags.contains(workTag)).toBe(true);
    });

    it('should return false when tag does not exist', () => {
      const tags = TagsMother.onlyWork();
      const personalTag = TagMother.personal();

      expect(tags.contains(personalTag)).toBe(false);
    });

    it('should return false when checking empty tags', () => {
      const tags = TagsMother.empty();
      const workTag = TagMother.work();

      expect(tags.contains(workTag)).toBe(false);
    });
  });

  describe('containsString', () => {
    it('should return true when tag string exists', () => {
      const tags = TagsMother.workAndPersonal();

      expect(tags.containsString('work')).toBe(true);
    });

    it('should return false when tag string does not exist', () => {
      const tags = TagsMother.onlyWork();

      expect(tags.containsString('personal')).toBe(false);
    });

    it('should work with normalized strings', () => {
      const tags = TagsMother.fromStrings(['work', 'important']);

      expect(tags.containsString('WORK')).toBe(true);
      expect(tags.containsString('Important')).toBe(true);
    });
  });

  describe('toStringArray', () => {
    it('should convert tags to string array', () => {
      const tags = TagsMother.fromStrings(['work', 'important']);
      const stringArray = tags.toStringArray();

      expect(stringArray).toEqual(['work', 'important']);
    });

    it('should return empty array for empty tags', () => {
      const tags = TagsMother.empty();
      const stringArray = tags.toStringArray();

      expect(stringArray).toEqual([]);
    });
  });

  describe('add', () => {
    it('should add new tag to collection', () => {
      const tags = TagsMother.onlyWork();
      const personalTag = TagMother.personal();

      const newTags = tags.add(personalTag);

      expect(newTags.count()).toBe(2);
      expect(newTags.contains(personalTag)).toBe(true);
      expect(newTags.containsString('work')).toBe(true);
    });

    it('should not add duplicate tag', () => {
      const tags = TagsMother.onlyWork();
      const workTag = TagMother.work();

      const newTags = tags.add(workTag);

      expect(newTags.count()).toBe(1);
      expect(newTags).toBe(tags); // Should return same instance
    });

    it('should maintain immutability when adding tag', () => {
      const originalTags = TagsMother.onlyWork();
      const personalTag = TagMother.personal();

      const newTags = originalTags.add(personalTag);

      expect(originalTags.count()).toBe(1);
      expect(newTags.count()).toBe(2);
      expect(originalTags).not.toBe(newTags);
    });
  });

  describe('remove', () => {
    it('should remove existing tag from collection', () => {
      const tags = TagsMother.workAndPersonal();
      const workTag = TagMother.work();

      const newTags = tags.remove(workTag);

      expect(newTags.count()).toBe(1);
      expect(newTags.contains(workTag)).toBe(false);
      expect(newTags.containsString('personal')).toBe(true);
    });

    it('should return new instance when removing non-existent tag', () => {
      const tags = TagsMother.onlyWork();
      const personalTag = TagMother.personal();

      const newTags = tags.remove(personalTag);

      expect(newTags.count()).toBe(1);
      expect(newTags.containsString('work')).toBe(true);
    });

    it('should maintain immutability when removing tag', () => {
      const originalTags = TagsMother.workAndPersonal();
      const workTag = TagMother.work();

      const newTags = originalTags.remove(workTag);

      expect(originalTags.count()).toBe(2);
      expect(newTags.count()).toBe(1);
      expect(originalTags).not.toBe(newTags);
    });

    it('should be able to remove all tags', () => {
      const tags = TagsMother.single();
      const importantTag = TagMother.important();

      const newTags = tags.remove(importantTag);

      expect(newTags.isEmpty()).toBe(true);
      expect(newTags.count()).toBe(0);
    });
  });

  describe('equals', () => {
    it('should return true when comparing same tags', () => {
      const tags1 = TagsMother.fromStrings(['work', 'important']);
      const tags2 = TagsMother.fromStrings(['work', 'important']);

      expect(tags1.equals(tags2)).toBe(true);
    });

    it('should return true when comparing tags in different order', () => {
      const tags1 = TagsMother.fromStrings(['work', 'important']);
      const tags2 = TagsMother.fromStrings(['important', 'work']);

      expect(tags1.equals(tags2)).toBe(true);
    });

    it('should return false when tags are different', () => {
      const tags1 = TagsMother.fromStrings(['work', 'important']);
      const tags2 = TagsMother.fromStrings(['work', 'urgent']);

      expect(tags1.equals(tags2)).toBe(false);
    });

    it('should return false when counts differ', () => {
      const tags1 = TagsMother.fromStrings(['work', 'important']);
      const tags2 = TagsMother.fromStrings(['work']);

      expect(tags1.equals(tags2)).toBe(false);
    });

    it('should return true when both are empty', () => {
      const tags1 = TagsMother.empty();
      const tags2 = TagsMother.empty();

      expect(tags1.equals(tags2)).toBe(true);
    });

    it('should return false when comparing with null', () => {
      const tags = TagsMother.workAndPersonal();

      expect(tags.equals(null as any)).toBe(false);
    });
  });

  describe('immutability', () => {
    it('should not allow modification of internal array', () => {
      const tags = TagsMother.multiple();
      const count = tags.count();

      expect(() => {
        (tags as any).value.push(TagMother.work());
      }).toThrow();

      expect(tags.count()).toBe(count);
    });

    it('should return new instance on add', () => {
      const original = TagsMother.onlyWork();
      const modified = original.add(TagMother.personal());

      expect(original).not.toBe(modified);
      expect(original.count()).toBe(1);
      expect(modified.count()).toBe(2);
    });

    it('should return new instance on remove', () => {
      const original = TagsMother.workAndPersonal();
      const modified = original.remove(TagMother.work());

      expect(original).not.toBe(modified);
      expect(original.count()).toBe(2);
      expect(modified.count()).toBe(1);
    });
  });
});
