import { faker } from '@faker-js/faker';
import { DomainException } from '../../src/Contexts/Shared/domain/DomainException';

// Implementaciones concretas para testing
export class TestDomainException extends DomainException {}

export class InvalidEmailException extends DomainException {
  constructor(email: string) {
    super(`Invalid email format: ${email}`);
  }
}

export class UserNotFoundException extends DomainException {
  constructor(userId: string) {
    super(`User not found: ${userId}`);
  }
}

export class DomainExceptionMother {
  static create(message?: string): TestDomainException {
    return new TestDomainException(message ?? faker.lorem.sentence());
  }

  static random(): TestDomainException {
    return new TestDomainException(faker.lorem.sentence());
  }

  static withMessage(message: string): TestDomainException {
    return new TestDomainException(message);
  }

  static invalidEmail(email?: string): InvalidEmailException {
    return new InvalidEmailException(email ?? faker.internet.email());
  }

  static userNotFound(userId?: string): UserNotFoundException {
    return new UserNotFoundException(userId ?? faker.string.uuid());
  }

  static genericError(): TestDomainException {
    return new TestDomainException('A domain error occurred');
  }
}
