import {
  DomainExceptionMother,
  InvalidEmailException,
  UserNotFoundException,
} from '../../../mothers/DomainExceptionMother';

describe('DomainException', () => {
  describe('constructor', () => {
    it('should create exception with message', () => {
      const message = 'Test error message';
      const exception = DomainExceptionMother.withMessage(message);

      expect(exception.message).toBe(message);
    });

    it('should be instance of Error', () => {
      const exception = DomainExceptionMother.create();

      expect(exception instanceof Error).toBe(true);
    });

    it('should have correct name property', () => {
      const exception = DomainExceptionMother.create();

      expect(exception.name).toBe('TestDomainException');
    });
  });

  describe('inheritance', () => {
    it('should allow creating specific domain exceptions', () => {
      const email = 'invalid-email';
      const exception = DomainExceptionMother.invalidEmail(email);

      expect(exception instanceof InvalidEmailException).toBe(true);
      expect(exception.message).toBe(`Invalid email format: ${email}`);
    });

    it('should maintain exception hierarchy', () => {
      const userId = 'user-123';
      const exception = DomainExceptionMother.userNotFound(userId);

      expect(exception instanceof UserNotFoundException).toBe(true);
      expect(exception instanceof Error).toBe(true);
      expect(exception.message).toBe(`User not found: ${userId}`);
    });

    it('should have correct name for specific exceptions', () => {
      const exception = DomainExceptionMother.invalidEmail('test@test.com');

      expect(exception.name).toBe('InvalidEmailException');
    });
  });

  describe('stack trace', () => {
    it('should have stack trace', () => {
      const exception = DomainExceptionMother.create();

      expect(exception.stack).toBeDefined();
    });

    it('should capture stack trace correctly', () => {
      const exception = DomainExceptionMother.create();

      expect(exception.stack).toContain('DomainException.test.ts');
    });
  });
});
