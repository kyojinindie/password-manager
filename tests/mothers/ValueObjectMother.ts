import { faker } from '@faker-js/faker';
import { ValueObject } from '../../src/Contexts/Shared/domain/ValueObject';

// Implementación concreta para testing
export class StringValueObject extends ValueObject<string> {}
export class NumberValueObject extends ValueObject<number> {}
export class ComplexValueObject extends ValueObject<{ name: string; age: number }> {}

export class StringValueObjectMother {
  static create(value: string): StringValueObject {
    return new StringValueObject(value);
  }

  static random(): StringValueObject {
    return new StringValueObject(faker.string.alpha(10));
  }

  static withValue(value: string): StringValueObject {
    return new StringValueObject(value);
  }

  static empty(): StringValueObject {
    return new StringValueObject('');
  }
}

export class NumberValueObjectMother {
  static create(value: number): NumberValueObject {
    return new NumberValueObject(value);
  }

  static random(): NumberValueObject {
    return new NumberValueObject(faker.number.int({ min: 1, max: 1000 }));
  }

  static withValue(value: number): NumberValueObject {
    return new NumberValueObject(value);
  }

  static zero(): NumberValueObject {
    return new NumberValueObject(0);
  }

  static fortyTwo(): NumberValueObject {
    return new NumberValueObject(42);
  }
}

export class ComplexValueObjectMother {
  static create(params?: { name?: string; age?: number }): ComplexValueObject {
    return new ComplexValueObject({
      name: params?.name ?? faker.person.fullName(),
      age: params?.age ?? faker.number.int({ min: 18, max: 80 }),
    });
  }

  static random(): ComplexValueObject {
    return new ComplexValueObject({
      name: faker.person.fullName(),
      age: faker.number.int({ min: 18, max: 100 }),
    });
  }

  static johnDoe(): ComplexValueObject {
    return new ComplexValueObject({ name: 'John Doe', age: 30 });
  }

  static janeDoe(): ComplexValueObject {
    return new ComplexValueObject({ name: 'Jane Doe', age: 28 });
  }
}
