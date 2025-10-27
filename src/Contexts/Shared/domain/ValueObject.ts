export abstract class ValueObject<T> {
  public constructor(protected readonly _value: T) {}

  public get value(): T {
    return this._value;
  }

  public equals(other: ValueObject<T>): boolean {
    if (other === null || other === undefined) {
      return false;
    }

    return JSON.stringify(this._value) === JSON.stringify(other._value);
  }

  public toString(): string {
    return String(this._value);
  }
}
