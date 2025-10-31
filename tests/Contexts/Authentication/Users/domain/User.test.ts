import { UserMother } from '../../../../mothers/UserMother';
import { UserIdMother } from '../../../../mothers/UserIdMother';
import { FailedLoginAttemptsMother } from '../../../../mothers/FailedLoginAttemptsMother';
import { LastLoginAtMother } from '../../../../mothers/LastLoginAtMother';
import { AccountLockedException } from '../../../../../src/Contexts/Authentication/Users/domain/AccountLockedException';
import { InactiveUserException } from '../../../../../src/Contexts/Authentication/Users/domain/InactiveUserException';
import { MockMasterPasswordHashingService } from '../../../../mocks/MockMasterPasswordHashingService';

describe('User', () => {
  describe('constructor', () => {
    it('should create a User with all properties', () => {
      const user = UserMother.random();

      expect(user.id).toBeDefined();
      expect(user.email).toBeDefined();
      expect(user.username).toBeDefined();
      expect(user.masterPasswordHash).toBeDefined();
      expect(user.salt).toBeDefined();
      expect(user.isActive).toBeDefined();
      expect(user.createdAt).toBeDefined();
    });

    it('should create an active user by default', () => {
      const user = UserMother.random();

      expect(user.isActive.value).toBe(true);
    });

    it('should set createdAt to current date', () => {
      const user = UserMother.random();
      const now = new Date();

      expect(user.createdAt.value.getTime()).toBeLessThanOrEqual(now.getTime());
    });
  });

  describe('create', () => {
    it('should create a new User with generated id', () => {
      const createParams = UserMother.createParams();

      const user = UserMother.createNew(
        createParams.email,
        createParams.username,
        createParams.masterPasswordHash,
        createParams.salt
      );

      expect(user.id).toBeDefined();
      expect(user.email.equals(createParams.email)).toBe(true);
      expect(user.username.equals(createParams.username)).toBe(true);
      expect(user.masterPasswordHash.equals(createParams.masterPasswordHash)).toBe(true);
      expect(user.salt.equals(createParams.salt)).toBe(true);
      expect(user.isActive.isTrue()).toBe(true);
    });
  });

  describe('equals', () => {
    it('should return true when comparing users with same id', () => {
      const userId = UserIdMother.random();
      const user1 = UserMother.withId(userId);
      const user2 = UserMother.withId(userId);

      expect(user1.equals(user2)).toBe(true);
    });

    it('should return false when comparing users with different ids', () => {
      const user1 = UserMother.random();
      const user2 = UserMother.random();

      expect(user1.equals(user2)).toBe(false);
    });

    it('should return false when comparing with null', () => {
      const user = UserMother.random();

      expect(user.equals(null as any)).toBe(false);
    });
  });

  describe('toPrimitives', () => {
    it('should return user data as primitives', () => {
      const user = UserMother.random();

      const primitives = user.toPrimitives();

      expect(primitives.id).toBe(user.id.value);
      expect(primitives.email).toBe(user.email.value);
      expect(primitives.username).toBe(user.username.value);
      expect(primitives.masterPasswordHash).toBe(user.masterPasswordHash.value);
      expect(primitives.salt).toBe(user.salt.value);
      expect(primitives.isActive).toBe(user.isActive.value);
      expect(primitives.createdAt).toBe(user.createdAt.value);
    });

    it('should include failedLoginAttempts and lastLoginAt in primitives', () => {
      const user = UserMother.withFailedAttempts(FailedLoginAttemptsMother.three());

      const primitives = user.toPrimitives();

      expect(primitives.failedLoginAttempts).toBe(3);
      expect(primitives.lastLoginAt).toBeDefined();
    });
  });

  describe('recordSuccessfulLogin', () => {
    it('should reset failed login attempts to zero', () => {
      const user = UserMother.withFourFailedAttempts();

      user.recordSuccessfulLogin();

      expect(user.failedLoginAttempts.isZero()).toBe(true);
    });

    it('should update lastLoginAt to current time', () => {
      const user = UserMother.neverLoggedIn();
      const before = new Date();

      user.recordSuccessfulLogin();

      const after = new Date();
      expect(user.lastLoginAt.isEmpty()).toBe(false);
      expect(user.lastLoginAt.value!.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(user.lastLoginAt.value!.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should reset attempts when account was locked', () => {
      const user = UserMother.withLockedAccount();

      user.recordSuccessfulLogin();

      expect(user.isAccountLocked()).toBe(false);
      expect(user.failedLoginAttempts.isZero()).toBe(true);
    });

    it('should throw InactiveUserException when user is inactive', () => {
      const user = UserMother.inactiveUser();

      expect(() => user.recordSuccessfulLogin()).toThrow(InactiveUserException);
    });

    it('should not modify lastLoginAt when user is inactive', () => {
      const user = UserMother.inactiveUser();
      const originalLastLogin = user.lastLoginAt;

      try {
        user.recordSuccessfulLogin();
      } catch (error) {
        // Expected exception
      }

      expect(user.lastLoginAt).toBe(originalLastLogin);
    });

    it('should work when user has zero failed attempts', () => {
      const user = UserMother.neverLoggedIn();

      user.recordSuccessfulLogin();

      expect(user.failedLoginAttempts.isZero()).toBe(true);
      expect(user.lastLoginAt.hasValue()).toBe(true);
    });
  });

  describe('recordFailedLoginAttempt', () => {
    it('should increment failed login attempts by one', () => {
      const user = UserMother.neverLoggedIn();

      user.recordFailedLoginAttempt();

      expect(user.failedLoginAttempts.value).toBe(1);
    });

    it('should increment from one to two attempts', () => {
      const user = UserMother.withOneFailedAttempt();

      user.recordFailedLoginAttempt();

      expect(user.failedLoginAttempts.value).toBe(2);
    });

    it('should lock account when reaching five attempts', () => {
      const user = UserMother.withFourFailedAttempts();

      user.recordFailedLoginAttempt();

      expect(user.isAccountLocked()).toBe(true);
    });

    it('should not exceed maximum attempts', () => {
      const user = UserMother.withLockedAccount();

      user.recordFailedLoginAttempt();

      expect(user.failedLoginAttempts.value).toBe(5);
    });

    it('should not modify lastLoginAt', () => {
      const lastLogin = LastLoginAtMother.yesterday();
      const user = UserMother.withLastLogin(lastLogin);

      user.recordFailedLoginAttempt();

      expect(user.lastLoginAt.equals(lastLogin)).toBe(true);
    });

    it('should work for inactive users', () => {
      const user = UserMother.inactiveUser();

      user.recordFailedLoginAttempt();

      expect(user.failedLoginAttempts.value).toBe(1);
    });
  });

  describe('isAccountLocked', () => {
    it('should return false when user has zero failed attempts', () => {
      const user = UserMother.neverLoggedIn();

      expect(user.isAccountLocked()).toBe(false);
    });

    it('should return false when user has less than five attempts', () => {
      const user = UserMother.withFourFailedAttempts();

      expect(user.isAccountLocked()).toBe(false);
    });

    it('should return true when user has five failed attempts', () => {
      const user = UserMother.withLockedAccount();

      expect(user.isAccountLocked()).toBe(true);
    });

    it('should return false when user has one failed attempt', () => {
      const user = UserMother.withOneFailedAttempt();

      expect(user.isAccountLocked()).toBe(false);
    });

    it('should return false after successful login resets attempts', () => {
      const user = UserMother.withFourFailedAttempts();

      user.recordSuccessfulLogin();

      expect(user.isAccountLocked()).toBe(false);
    });
  });

  describe('verifyPassword', () => {
    it('should return true when password is correct', async () => {
      const user = UserMother.activeUser();
      const plainPassword = 'correctPassword123!';
      const hashingService =
        MockMasterPasswordHashingService.withSuccessfulVerification();

      const result = await user.verifyPassword(plainPassword, hashingService);

      expect(result).toBe(true);
    });

    it('should return false when password is incorrect', async () => {
      const user = UserMother.activeUser();
      const plainPassword = 'wrongPassword';
      const hashingService = MockMasterPasswordHashingService.withFailedVerification();

      const result = await user.verifyPassword(plainPassword, hashingService);

      expect(result).toBe(false);
    });

    it('should work for inactive users', async () => {
      const user = UserMother.inactiveUser();
      const plainPassword = 'somePassword';
      const hashingService =
        MockMasterPasswordHashingService.withSuccessfulVerification();

      const result = await user.verifyPassword(plainPassword, hashingService);

      expect(result).toBe(true);
    });

    it('should work for locked accounts', async () => {
      const user = UserMother.withLockedAccount();
      const plainPassword = 'somePassword';
      const hashingService =
        MockMasterPasswordHashingService.withSuccessfulVerification();

      const result = await user.verifyPassword(plainPassword, hashingService);

      expect(result).toBe(true);
    });
  });

  describe('ensureCanLogin', () => {
    it('should not throw when user is active and not locked', () => {
      const user = UserMother.activeUser();

      expect(() => user.ensureCanLogin()).not.toThrow();
    });

    it('should throw InactiveUserException when user is inactive', () => {
      const user = UserMother.inactiveUser();

      expect(() => user.ensureCanLogin()).toThrow(InactiveUserException);
    });

    it('should throw AccountLockedException when account is locked', () => {
      const user = UserMother.withLockedAccount();

      expect(() => user.ensureCanLogin()).toThrow(AccountLockedException);
    });

    it('should not throw when user has failed attempts but not locked', () => {
      const user = UserMother.withFourFailedAttempts();

      expect(() => user.ensureCanLogin()).not.toThrow();
    });

    it('should throw InactiveUserException before AccountLockedException', () => {
      const user = UserMother.create({
        isActive: UserMother.inactiveUser().isActive,
        failedLoginAttempts: FailedLoginAttemptsMother.locked(),
      });

      expect(() => user.ensureCanLogin()).toThrow(InactiveUserException);
    });

    it('should not throw when user has zero attempts', () => {
      const user = UserMother.neverLoggedIn();

      expect(() => user.ensureCanLogin()).not.toThrow();
    });

    it('should not throw when user has one failed attempt', () => {
      const user = UserMother.withOneFailedAttempt();

      expect(() => user.ensureCanLogin()).not.toThrow();
    });
  });

  describe('login flow integration', () => {
    it('should handle complete successful login flow', async () => {
      const user = UserMother.withFourFailedAttempts();
      const hashingService =
        MockMasterPasswordHashingService.withSuccessfulVerification();

      // Verify user can login
      user.ensureCanLogin();

      // Verify password
      const isValid = await user.verifyPassword('password', hashingService);
      expect(isValid).toBe(true);

      // Record successful login
      user.recordSuccessfulLogin();

      expect(user.failedLoginAttempts.isZero()).toBe(true);
      expect(user.lastLoginAt.hasValue()).toBe(true);
      expect(user.isAccountLocked()).toBe(false);
    });

    it('should handle complete failed login flow', async () => {
      const user = UserMother.withFourFailedAttempts();
      const hashingService = MockMasterPasswordHashingService.withFailedVerification();

      // Verify user can login
      user.ensureCanLogin();

      // Verify password (incorrect)
      const isValid = await user.verifyPassword('wrongPassword', hashingService);
      expect(isValid).toBe(false);

      // Record failed attempt
      user.recordFailedLoginAttempt();

      expect(user.isAccountLocked()).toBe(true);
      expect(() => user.ensureCanLogin()).toThrow(AccountLockedException);
    });

    it('should handle multiple failed attempts leading to lock', () => {
      const user = UserMother.neverLoggedIn();

      for (let i = 0; i < 5; i++) {
        user.recordFailedLoginAttempt();
      }

      expect(user.isAccountLocked()).toBe(true);
      expect(() => user.ensureCanLogin()).toThrow(AccountLockedException);
    });

    it('should unlock account after successful login', () => {
      const user = UserMother.withLockedAccount();

      // This should throw because account is locked
      expect(() => user.ensureCanLogin()).toThrow(AccountLockedException);

      // However, if somehow password is verified (e.g., admin override),
      // recordSuccessfulLogin should unlock
      // Note: In real flow, this wouldn't happen because ensureCanLogin would prevent it
      // But we're testing the method behavior in isolation
      user.recordSuccessfulLogin();

      expect(user.isAccountLocked()).toBe(false);
      expect(() => user.ensureCanLogin()).not.toThrow();
    });
  });
});
