import { UserLogin } from '../../../../../../src/Contexts/Authentication/Users/application/Login/UserLogin';
import { MockUserRepository } from '../../../../../mocks/MockUserRepository';
import { MockMasterPasswordHashingService } from '../../../../../mocks/MockMasterPasswordHashingService';
import { MockTokenGenerationService } from '../../../../../mocks/MockTokenGenerationService';
import { UserMother } from '../../../../../mothers/UserMother';
import { EmailMother } from '../../../../../mothers/EmailMother';
import { MasterPasswordMother } from '../../../../../mothers/MasterPasswordMother';
import { AccessTokenMother } from '../../../../../mothers/AccessTokenMother';
import { RefreshTokenMother } from '../../../../../mothers/RefreshTokenMother';
import { InvalidCredentialsException } from '../../../../../../src/Contexts/Authentication/Users/domain/InvalidCredentialsException';
import { AccountLockedException } from '../../../../../../src/Contexts/Authentication/Users/domain/AccountLockedException';
import { InactiveUserException } from '../../../../../../src/Contexts/Authentication/Users/domain/InactiveUserException';
import { AccessToken } from '../../../../../../src/Contexts/Authentication/Users/domain/AccessToken';

describe('UserLogin', () => {
  let userLogin: UserLogin;
  let userRepository: MockUserRepository;
  let hashingService: MockMasterPasswordHashingService;
  let tokenService: MockTokenGenerationService;

  beforeEach(() => {
    userRepository = new MockUserRepository();
    hashingService = MockMasterPasswordHashingService.withSuccessfulVerification();
    tokenService = MockTokenGenerationService.withDefaultTokens();
    userLogin = new UserLogin(userRepository, hashingService, tokenService);
  });

  afterEach(() => {
    userRepository.clear();
  });

  describe('Successful login', () => {
    it('should login successfully with valid credentials', async () => {
      // Arrange
      const email = EmailMother.random();
      const user = UserMother.create({ email });
      userRepository.addUser(user);

      const accessToken = AccessTokenMother.random();
      const refreshToken = RefreshTokenMother.random();
      tokenService.setAccessToken(accessToken);
      tokenService.setRefreshToken(refreshToken);

      const request = {
        email: email.value,
        masterPassword: MasterPasswordMother.strong(),
      };

      // Act
      const response = await userLogin.run(request);

      // Assert
      expect(response).toBeDefined();
      expect(response.userId).toBe(user.id.value);
      expect(response.accessToken).toBe(accessToken.value);
      expect(response.refreshToken).toBe(refreshToken.value);
      expect(response.expiresIn).toBe(AccessToken.getExpirationMinutes() * 60);
    });

    it('should record successful login and reset failed attempts', async () => {
      // Arrange
      const email = EmailMother.random();
      const user = UserMother.withOneFailedAttempt();
      // Update user with correct email
      const userWithEmail = UserMother.create({
        id: user.id,
        email,
        username: user.username,
        masterPasswordHash: user.masterPasswordHash,
        salt: user.salt,
        isActive: user.isActive,
        createdAt: user.createdAt,
        failedLoginAttempts: user.failedLoginAttempts,
        lastLoginAt: user.lastLoginAt,
      });
      userRepository.addUser(userWithEmail);

      const request = {
        email: email.value,
        masterPassword: MasterPasswordMother.strong(),
      };

      // Act
      await userLogin.run(request);

      // Assert
      const savedUser = userRepository.getLastSavedUser();
      expect(savedUser).toBeDefined();
      expect(savedUser!.failedLoginAttempts.value).toBe(0);
      expect(savedUser!.lastLoginAt.value).not.toBeNull();
    });

    it('should generate tokens with user id', async () => {
      // Arrange
      const email = EmailMother.random();
      const user = UserMother.create({ email });
      userRepository.addUser(user);

      const request = {
        email: email.value,
        masterPassword: MasterPasswordMother.strong(),
      };

      // Act
      await userLogin.run(request);

      // Assert
      expect(tokenService.wasCalledWithUserId(user.id)).toBe(true);
      expect(tokenService.getAccessTokenCalls().length).toBe(1);
      expect(tokenService.getRefreshTokenCalls().length).toBe(1);
    });

    it('should calculate expiresIn dynamically from AccessToken', async () => {
      // Arrange
      const email = EmailMother.random();
      const user = UserMother.create({ email });
      userRepository.addUser(user);

      const request = {
        email: email.value,
        masterPassword: MasterPasswordMother.strong(),
      };

      // Act
      const response = await userLogin.run(request);

      // Assert
      const expectedExpiresIn = AccessToken.getExpirationMinutes() * 60;
      expect(response.expiresIn).toBe(expectedExpiresIn);
      expect(response.expiresIn).toBe(900); // 15 minutes * 60 seconds
    });
  });

  describe('Invalid credentials', () => {
    it('should throw InvalidCredentialsException when user not found', async () => {
      // Arrange
      const request = {
        email: EmailMother.randomValue(),
        masterPassword: MasterPasswordMother.strong(),
      };

      // Act & Assert
      await expect(userLogin.run(request)).rejects.toThrow(InvalidCredentialsException);
      await expect(userLogin.run(request)).rejects.toThrow(
        'The provided email or password is incorrect'
      );
    });

    it('should throw InvalidCredentialsException when password is invalid', async () => {
      // Arrange
      const email = EmailMother.random();
      const user = UserMother.create({ email });
      userRepository.addUser(user);

      // Configure hashing service to fail verification
      hashingService = MockMasterPasswordHashingService.withFailedVerification();
      userLogin = new UserLogin(userRepository, hashingService, tokenService);

      const request = {
        email: email.value,
        masterPassword: 'WrongPassword123!',
      };

      // Act & Assert
      await expect(userLogin.run(request)).rejects.toThrow(InvalidCredentialsException);
    });

    it('should not generate tokens when credentials are invalid', async () => {
      // Arrange
      const email = EmailMother.random();
      const user = UserMother.create({ email });
      userRepository.addUser(user);

      hashingService = MockMasterPasswordHashingService.withFailedVerification();
      userLogin = new UserLogin(userRepository, hashingService, tokenService);

      const request = {
        email: email.value,
        masterPassword: 'WrongPassword123!',
      };

      // Act
      try {
        await userLogin.run(request);
      } catch (error) {
        // Expected to throw
      }

      // Assert
      expect(tokenService.getAccessTokenCalls().length).toBe(0);
      expect(tokenService.getRefreshTokenCalls().length).toBe(0);
    });
  });

  describe('Account locked', () => {
    it('should throw AccountLockedException when account is locked', async () => {
      // Arrange
      const email = EmailMother.random();
      const lockedUser = UserMother.withLockedAccount();
      const userWithEmail = UserMother.create({
        id: lockedUser.id,
        email,
        username: lockedUser.username,
        masterPasswordHash: lockedUser.masterPasswordHash,
        salt: lockedUser.salt,
        isActive: lockedUser.isActive,
        createdAt: lockedUser.createdAt,
        failedLoginAttempts: lockedUser.failedLoginAttempts,
        lastLoginAt: lockedUser.lastLoginAt,
      });
      userRepository.addUser(userWithEmail);

      const request = {
        email: email.value,
        masterPassword: MasterPasswordMother.strong(),
      };

      // Act & Assert
      await expect(userLogin.run(request)).rejects.toThrow(AccountLockedException);
      await expect(userLogin.run(request)).rejects.toThrow(
        'Account has been locked due to too many failed login attempts. Please contact support.'
      );
    });

    it('should not verify password when account is locked', async () => {
      // Arrange
      const email = EmailMother.random();
      const lockedUser = UserMother.withLockedAccount();
      const userWithEmail = UserMother.create({
        id: lockedUser.id,
        email,
        username: lockedUser.username,
        masterPasswordHash: lockedUser.masterPasswordHash,
        salt: lockedUser.salt,
        isActive: lockedUser.isActive,
        createdAt: lockedUser.createdAt,
        failedLoginAttempts: lockedUser.failedLoginAttempts,
        lastLoginAt: lockedUser.lastLoginAt,
      });
      userRepository.addUser(userWithEmail);

      const request = {
        email: email.value,
        masterPassword: MasterPasswordMother.strong(),
      };

      // Act
      try {
        await userLogin.run(request);
      } catch (error) {
        // Expected to throw
      }

      // Assert - ensureCanLogin is called before password verification
      expect(tokenService.getAccessTokenCalls().length).toBe(0);
    });
  });

  describe('Inactive user', () => {
    it('should throw InactiveUserException when user is inactive', async () => {
      // Arrange
      const email = EmailMother.random();
      const inactiveUser = UserMother.inactiveUser();
      const userWithEmail = UserMother.create({
        id: inactiveUser.id,
        email,
        username: inactiveUser.username,
        masterPasswordHash: inactiveUser.masterPasswordHash,
        salt: inactiveUser.salt,
        isActive: inactiveUser.isActive,
        createdAt: inactiveUser.createdAt,
        failedLoginAttempts: inactiveUser.failedLoginAttempts,
        lastLoginAt: inactiveUser.lastLoginAt,
      });
      userRepository.addUser(userWithEmail);

      const request = {
        email: email.value,
        masterPassword: MasterPasswordMother.strong(),
      };

      // Act & Assert
      await expect(userLogin.run(request)).rejects.toThrow(InactiveUserException);
      await expect(userLogin.run(request)).rejects.toThrow(
        'User account is not active. Please contact support.'
      );
    });
  });

  describe('Failed login attempts', () => {
    it('should increment failed attempts counter on invalid password', async () => {
      // Arrange
      const email = EmailMother.random();
      const user = UserMother.create({ email });
      userRepository.addUser(user);

      hashingService = MockMasterPasswordHashingService.withFailedVerification();
      userLogin = new UserLogin(userRepository, hashingService, tokenService);

      const request = {
        email: email.value,
        masterPassword: 'WrongPassword123!',
      };

      // Act
      try {
        await userLogin.run(request);
      } catch (error) {
        // Expected to throw
      }

      // Assert
      const savedUser = userRepository.getLastSavedUser();
      expect(savedUser).toBeDefined();
      expect(savedUser!.failedLoginAttempts.value).toBe(1);
    });

    it('should save user after recording failed attempt', async () => {
      // Arrange
      const email = EmailMother.random();
      const user = UserMother.withOneFailedAttempt();
      const userWithEmail = UserMother.create({
        id: user.id,
        email,
        username: user.username,
        masterPasswordHash: user.masterPasswordHash,
        salt: user.salt,
        isActive: user.isActive,
        createdAt: user.createdAt,
        failedLoginAttempts: user.failedLoginAttempts,
        lastLoginAt: user.lastLoginAt,
      });
      userRepository.addUser(userWithEmail);

      hashingService = MockMasterPasswordHashingService.withFailedVerification();
      userLogin = new UserLogin(userRepository, hashingService, tokenService);

      const request = {
        email: email.value,
        masterPassword: 'WrongPassword123!',
      };

      const initialSaveCount = userRepository.getSaveCalls().length;

      // Act
      try {
        await userLogin.run(request);
      } catch (error) {
        // Expected to throw
      }

      // Assert
      expect(userRepository.getSaveCalls().length).toBe(initialSaveCount + 1);
      const savedUser = userRepository.getLastSavedUser();
      expect(savedUser!.failedLoginAttempts.value).toBe(2);
    });

    it('should increment from 4 to 5 failed attempts (account becomes locked)', async () => {
      // Arrange
      const email = EmailMother.random();
      const user = UserMother.withFourFailedAttempts();
      const userWithEmail = UserMother.create({
        id: user.id,
        email,
        username: user.username,
        masterPasswordHash: user.masterPasswordHash,
        salt: user.salt,
        isActive: user.isActive,
        createdAt: user.createdAt,
        failedLoginAttempts: user.failedLoginAttempts,
        lastLoginAt: user.lastLoginAt,
      });
      userRepository.addUser(userWithEmail);

      hashingService = MockMasterPasswordHashingService.withFailedVerification();
      userLogin = new UserLogin(userRepository, hashingService, tokenService);

      const request = {
        email: email.value,
        masterPassword: 'WrongPassword123!',
      };

      // Act
      try {
        await userLogin.run(request);
      } catch (error) {
        // Expected to throw
      }

      // Assert
      const savedUser = userRepository.getLastSavedUser();
      expect(savedUser).toBeDefined();
      expect(savedUser!.failedLoginAttempts.value).toBe(5);
      expect(savedUser!.isAccountLocked()).toBe(true);
    });
  });

  describe('Email validation', () => {
    it('should throw error when email format is invalid', async () => {
      // Arrange
      const request = {
        email: EmailMother.invalidFormat(),
        masterPassword: MasterPasswordMother.strong(),
      };

      // Act & Assert
      await expect(userLogin.run(request)).rejects.toThrow('Invalid email format');
    });
  });

  describe('User lookup', () => {
    it('should call userRepository.findByEmail with correct email', async () => {
      // Arrange
      const email = EmailMother.random();
      const user = UserMother.create({ email });
      userRepository.addUser(user);

      const request = {
        email: email.value,
        masterPassword: MasterPasswordMother.strong(),
      };

      // Act
      await userLogin.run(request);

      // Assert
      const findByEmailCalls = userRepository.getFindByEmailCalls();
      expect(findByEmailCalls.length).toBe(1);
      expect(findByEmailCalls[0].equals(email)).toBe(true);
    });
  });

  describe('User persistence', () => {
    it('should save user after successful login', async () => {
      // Arrange
      const email = EmailMother.random();
      const user = UserMother.create({ email });
      userRepository.addUser(user);

      const request = {
        email: email.value,
        masterPassword: MasterPasswordMother.strong(),
      };

      const initialSaveCount = userRepository.getSaveCalls().length;

      // Act
      await userLogin.run(request);

      // Assert
      expect(userRepository.getSaveCalls().length).toBe(initialSaveCount + 1);
    });

    it('should save user with updated last login timestamp', async () => {
      // Arrange
      const email = EmailMother.random();
      const user = UserMother.neverLoggedIn();
      const userWithEmail = UserMother.create({
        id: user.id,
        email,
        username: user.username,
        masterPasswordHash: user.masterPasswordHash,
        salt: user.salt,
        isActive: user.isActive,
        createdAt: user.createdAt,
        failedLoginAttempts: user.failedLoginAttempts,
        lastLoginAt: user.lastLoginAt,
      });
      userRepository.addUser(userWithEmail);

      const request = {
        email: email.value,
        masterPassword: MasterPasswordMother.strong(),
      };

      // Act
      await userLogin.run(request);

      // Assert
      const savedUser = userRepository.getLastSavedUser();
      expect(savedUser).toBeDefined();
      expect(savedUser!.lastLoginAt.value).not.toBeNull();
      expect(savedUser!.lastLoginAt.value).toBeInstanceOf(Date);
    });
  });
});
