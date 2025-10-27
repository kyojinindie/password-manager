import { faker } from '@faker-js/faker';
import { AggregateRoot } from '../../src/Contexts/Shared/domain/AggregateRoot';

// Implementación concreta para testing
export class TestAggregate extends AggregateRoot {
  constructor(
    private readonly _id: string,
    private _value: string
  ) {
    super();
  }

  public get id(): string {
    return this._id;
  }

  public get value(): string {
    return this._value;
  }

  public updateValue(newValue: string): void {
    this._value = newValue;
  }
}

export class AggregateRootMother {
  static create(params?: { id?: string; value?: string }): TestAggregate {
    return new TestAggregate(
      params?.id ?? faker.string.uuid(),
      params?.value ?? faker.lorem.word()
    );
  }

  static random(): TestAggregate {
    return new TestAggregate(faker.string.uuid(), faker.lorem.word());
  }

  static withId(id: string): TestAggregate {
    return new TestAggregate(id, faker.lorem.word());
  }

  static withValue(value: string): TestAggregate {
    return new TestAggregate(faker.string.uuid(), value);
  }
}
