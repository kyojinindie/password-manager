import { ValueObject } from '../../../Shared/domain/ValueObject';
import { Tag } from './Tag';

/**
 * Tags Value Object
 *
 * Represents a collection of tags for a password entry.
 * This is a collection VO that ensures no duplicate tags exist.
 */
export class Tags extends ValueObject<readonly Tag[]> {
  public constructor(tags: Tag[]) {
    const uniqueTags = Tags.removeDuplicates(tags);
    super(uniqueTags);
  }

  public static empty(): Tags {
    return new Tags([]);
  }

  public static fromStrings(values: string[]): Tags {
    const tags = values.map(value => new Tag(value));
    return new Tags(tags);
  }

  public isEmpty(): boolean {
    return this._value.length === 0;
  }

  public count(): number {
    return this._value.length;
  }

  public contains(tag: Tag): boolean {
    return this._value.some(t => t.equals(tag));
  }

  public containsString(value: string): boolean {
    const searchTag = new Tag(value);
    return this.contains(searchTag);
  }

  public toStringArray(): string[] {
    return this._value.map(tag => tag.value);
  }

  /**
   * Adds a new tag to the collection.
   * Returns a new Tags instance (immutability).
   */
  public add(tag: Tag): Tags {
    if (this.contains(tag)) {
      return this; // Already exists, return same instance
    }
    return new Tags([...this._value, tag]);
  }

  /**
   * Removes a tag from the collection.
   * Returns a new Tags instance (immutability).
   */
  public remove(tag: Tag): Tags {
    const filtered = this._value.filter(t => !t.equals(tag));
    return new Tags([...filtered]);
  }

  private static removeDuplicates(tags: Tag[]): readonly Tag[] {
    const seen = new Set<string>();
    const unique: Tag[] = [];

    for (const tag of tags) {
      if (!seen.has(tag.value)) {
        seen.add(tag.value);
        unique.push(tag);
      }
    }

    return Object.freeze(unique);
  }

  public equals(other: Tags): boolean {
    if (!other || !(other instanceof Tags)) {
      return false;
    }

    if (this._value.length !== other._value.length) {
      return false;
    }

    // Check if all tags exist in both collections
    return this._value.every(tag => other.contains(tag));
  }
}
