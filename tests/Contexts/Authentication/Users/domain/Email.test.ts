import { EmailMother } from '../../../../mothers/EmailMother';

describe('Email', () => {
  describe('constructor', () => {
    it('should create an Email with valid format', () => {
      const email = EmailMother.random();

      expect(email.value).toBeDefined();
      expect(email.value).toContain('@');
    });

    it('should normalize email to lowercase', () => {
      const email = EmailMother.uppercase();

      expect(email.value).toBe(email.value.toLowerCase());
    });

    it('should trim whitespace', () => {
      const result = EmailMother.withWhitespace();

      expect(result.email.value).toBe(result.trimmed);
    });

    it('should throw error when value is empty', () => {
      const invalidEmail = EmailMother.invalidEmpty();

      expect(() => EmailMother.create(invalidEmail)).toThrow(
        'Email cannot be empty'
      );
    });

    it('should throw error when format is invalid', () => {
      const invalidEmail = EmailMother.invalidFormat();

      expect(() => EmailMother.create(invalidEmail)).toThrow(
        'Invalid email format'
      );
    });

    it('should throw error when missing @ symbol', () => {
      const invalidEmail = EmailMother.invalidWithoutAt();

      expect(() => EmailMother.create(invalidEmail)).toThrow(
        'Invalid email format'
      );
    });

    it('should throw error when missing domain', () => {
      const invalidEmail = EmailMother.invalidWithoutDomain();

      expect(() => EmailMother.create(invalidEmail)).toThrow(
        'Invalid email format'
      );
    });

    it('should throw error when value is null', () => {
      expect(() => EmailMother.create(null as any)).toThrow(
        'Email cannot be empty'
      );
    });

    it('should throw error when value is undefined', () => {
      expect(() => EmailMother.create(undefined as any)).toThrow(
        'Email cannot be empty'
      );
    });
  });

  describe('domain', () => {
    it('should extract domain from email', () => {
      const email = EmailMother.withDomain('example.com');

      expect(email.domain).toBe('example.com');
    });

    it('should extract domain from subdomain email', () => {
      const email = EmailMother.withDomain('mail.example.com');

      expect(email.domain).toBe('mail.example.com');
    });
  });

  describe('equals', () => {
    it('should return true when comparing same email values', () => {
      const emailValue = EmailMother.randomValue();
      const email1 = EmailMother.create(emailValue);
      const email2 = EmailMother.create(emailValue);

      expect(email1.equals(email2)).toBe(true);
    });

    it('should return true when comparing emails with different casing', () => {
      const emailValue = EmailMother.randomValue();
      const email1 = EmailMother.create(emailValue.toUpperCase());
      const email2 = EmailMother.create(emailValue.toLowerCase());

      expect(email1.equals(email2)).toBe(true);
    });

    it('should return false when comparing different emails', () => {
      const email1 = EmailMother.random();
      const email2 = EmailMother.random();

      expect(email1.equals(email2)).toBe(false);
    });

    it('should return false when comparing with null', () => {
      const email = EmailMother.random();

      expect(email.equals(null as any)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return email as string', () => {
      const emailValue = EmailMother.randomValue();
      const email = EmailMother.create(emailValue);

      expect(email.toString()).toBe(emailValue);
    });
  });
});
