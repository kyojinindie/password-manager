import { SessionRefresher } from '../../../../../../src/Contexts/Authentication/Users/application/RefreshSession/SessionRefresher';
import { MockTokenGenerationService } from '../../../../../mocks/MockTokenGenerationService';
import { MockTokenBlacklistService } from '../../../../../mocks/MockTokenBlacklistService';
import { RefreshTokenMother } from '../../../../../mothers/RefreshTokenMother';
import { AccessTokenMother } from '../../../../../mothers/AccessTokenMother';
import { UserIdMother } from '../../../../../mothers/UserIdMother';
import { InvalidRefreshTokenException } from '../../../../../../src/Contexts/Authentication/Users/domain/InvalidRefreshTokenException';
import { AccessToken } from '../../../../../../src/Contexts/Authentication/Users/domain/AccessToken';

describe('SessionRefresher', () => {
  let sessionRefresher: SessionRefresher;
  let tokenService: MockTokenGenerationService;
  let blacklistService: MockTokenBlacklistService;

  beforeEach(() => {
    tokenService = MockTokenGenerationService.withDefaultTokens();
    blacklistService = new MockTokenBlacklistService();
    sessionRefresher = new SessionRefresher(tokenService, blacklistService);
  });

  afterEach(() => {
    blacklistService.clear();
  });

  describe('Successful token refresh', () => {
    it('should refresh session successfully with valid refresh token', async () => {
      // Arrange
      const userId = UserIdMother.random();
      const refreshToken = RefreshTokenMother.random();
      const newAccessToken = AccessTokenMother.random();

      tokenService = MockTokenGenerationService.withSuccessfulVerification(userId);
      tokenService.setAccessToken(newAccessToken);
      sessionRefresher = new SessionRefresher(tokenService, blacklistService);

      const request = {
        refreshToken: refreshToken.value,
      };

      // Act
      const response = await sessionRefresher.run(request);

      // Assert
      expect(response).toBeDefined();
      expect(response.accessToken).toBe(newAccessToken.value);
      expect(response.expiresIn).toBe(AccessToken.getExpirationMinutes() * 60);
    });

    it('should verify refresh token is not blacklisted', async () => {
      // Arrange
      const userId = UserIdMother.random();
      const refreshToken = RefreshTokenMother.random();

      tokenService = MockTokenGenerationService.withSuccessfulVerification(userId);
      sessionRefresher = new SessionRefresher(tokenService, blacklistService);

      const request = {
        refreshToken: refreshToken.value,
      };

      // Act
      await sessionRefresher.run(request);

      // Assert
      const blacklistChecks = blacklistService.getIsRefreshTokenBlacklistedCalls();
      expect(blacklistChecks.length).toBe(1);
      expect(blacklistChecks[0].equals(refreshToken)).toBe(true);
    });

    it('should verify refresh token and extract userId', async () => {
      // Arrange
      const userId = UserIdMother.random();
      const refreshToken = RefreshTokenMother.random();

      tokenService = MockTokenGenerationService.withSuccessfulVerification(userId);
      sessionRefresher = new SessionRefresher(tokenService, blacklistService);

      const request = {
        refreshToken: refreshToken.value,
      };

      // Act
      await sessionRefresher.run(request);

      // Assert
      const verificationCalls = tokenService.getVerifyRefreshTokenCalls();
      expect(verificationCalls.length).toBe(1);
      expect(verificationCalls[0].equals(refreshToken)).toBe(true);
    });

    it('should generate new access token with extracted userId', async () => {
      // Arrange
      const userId = UserIdMother.random();
      const refreshToken = RefreshTokenMother.random();

      tokenService = MockTokenGenerationService.withSuccessfulVerification(userId);
      sessionRefresher = new SessionRefresher(tokenService, blacklistService);

      const request = {
        refreshToken: refreshToken.value,
      };

      // Act
      await sessionRefresher.run(request);

      // Assert
      const accessTokenCalls = tokenService.getAccessTokenCalls();
      expect(accessTokenCalls.length).toBe(1);
      expect(accessTokenCalls[0].equals(userId)).toBe(true);
    });

    it('should calculate expiresIn dynamically from AccessToken', async () => {
      // Arrange
      const userId = UserIdMother.random();
      const refreshToken = RefreshTokenMother.random();

      tokenService = MockTokenGenerationService.withSuccessfulVerification(userId);
      sessionRefresher = new SessionRefresher(tokenService, blacklistService);

      const request = {
        refreshToken: refreshToken.value,
      };

      // Act
      const response = await sessionRefresher.run(request);

      // Assert
      const expectedExpiresIn = AccessToken.getExpirationMinutes() * 60;
      expect(response.expiresIn).toBe(expectedExpiresIn);
      expect(response.expiresIn).toBe(900); // 15 minutes * 60 seconds
    });

    it('should not generate refresh token, only access token', async () => {
      // Arrange
      const userId = UserIdMother.random();
      const refreshToken = RefreshTokenMother.random();

      tokenService = MockTokenGenerationService.withSuccessfulVerification(userId);
      sessionRefresher = new SessionRefresher(tokenService, blacklistService);

      const request = {
        refreshToken: refreshToken.value,
      };

      // Act
      await sessionRefresher.run(request);

      // Assert
      expect(tokenService.getAccessTokenCalls().length).toBe(1);
      expect(tokenService.getRefreshTokenCalls().length).toBe(0);
    });

    it('should return RefreshSessionResponse with correct structure', async () => {
      // Arrange
      const userId = UserIdMother.random();
      const refreshToken = RefreshTokenMother.random();
      const newAccessToken = AccessTokenMother.random();

      tokenService = MockTokenGenerationService.withSuccessfulVerification(userId);
      tokenService.setAccessToken(newAccessToken);
      sessionRefresher = new SessionRefresher(tokenService, blacklistService);

      const request = {
        refreshToken: refreshToken.value,
      };

      // Act
      const response = await sessionRefresher.run(request);

      // Assert
      expect(response).toHaveProperty('accessToken');
      expect(response).toHaveProperty('expiresIn');
      expect(typeof response.accessToken).toBe('string');
      expect(typeof response.expiresIn).toBe('number');
      expect(response.expiresIn).toBeGreaterThan(0);
    });
  });

  describe('Token blacklisted', () => {
    it('should throw InvalidRefreshTokenException when token is blacklisted', async () => {
      // Arrange
      const refreshToken = RefreshTokenMother.random();

      // Add token to blacklist first
      await blacklistService.addToBlacklist(undefined, refreshToken);

      const request = {
        refreshToken: refreshToken.value,
      };

      // Act & Assert
      await expect(sessionRefresher.run(request)).rejects.toThrow(
        InvalidRefreshTokenException
      );
      await expect(sessionRefresher.run(request)).rejects.toThrow(
        'The provided refresh token is invalid, expired, or has been revoked'
      );
    });

    it('should check blacklist before verifying token', async () => {
      // Arrange
      const refreshToken = RefreshTokenMother.random();

      // Add token to blacklist
      await blacklistService.addToBlacklist(undefined, refreshToken);

      const request = {
        refreshToken: refreshToken.value,
      };

      // Act
      try {
        await sessionRefresher.run(request);
      } catch (error) {
        // Expected to throw
      }

      // Assert - token verification should not be called if blacklisted
      expect(tokenService.getVerifyRefreshTokenCalls().length).toBe(0);
      expect(blacklistService.getIsRefreshTokenBlacklistedCalls().length).toBeGreaterThan(
        0
      );
    });

    it('should not generate access token when token is blacklisted', async () => {
      // Arrange
      const refreshToken = RefreshTokenMother.random();

      // Add token to blacklist
      await blacklistService.addToBlacklist(undefined, refreshToken);

      const request = {
        refreshToken: refreshToken.value,
      };

      // Act
      try {
        await sessionRefresher.run(request);
      } catch (error) {
        // Expected to throw
      }

      // Assert
      expect(tokenService.getAccessTokenCalls().length).toBe(0);
    });
  });

  describe('Invalid token verification', () => {
    it('should throw InvalidRefreshTokenException when token verification fails', async () => {
      // Arrange
      const refreshToken = RefreshTokenMother.random();

      tokenService = MockTokenGenerationService.withFailedVerification();
      sessionRefresher = new SessionRefresher(tokenService, blacklistService);

      const request = {
        refreshToken: refreshToken.value,
      };

      // Act & Assert
      await expect(sessionRefresher.run(request)).rejects.toThrow(
        InvalidRefreshTokenException
      );
      await expect(sessionRefresher.run(request)).rejects.toThrow(
        'The provided refresh token is invalid, expired, or has been revoked'
      );
    });

    it('should throw InvalidRefreshTokenException when token is expired', async () => {
      // Arrange
      const expiredToken = RefreshTokenMother.random();

      tokenService = MockTokenGenerationService.withFailedVerification();
      sessionRefresher = new SessionRefresher(tokenService, blacklistService);

      const request = {
        refreshToken: expiredToken.value,
      };

      // Act & Assert
      await expect(sessionRefresher.run(request)).rejects.toThrow(
        InvalidRefreshTokenException
      );
    });

    it('should not generate access token when verification fails', async () => {
      // Arrange
      const refreshToken = RefreshTokenMother.random();

      tokenService = MockTokenGenerationService.withFailedVerification();
      sessionRefresher = new SessionRefresher(tokenService, blacklistService);

      const request = {
        refreshToken: refreshToken.value,
      };

      // Act
      try {
        await sessionRefresher.run(request);
      } catch (error) {
        // Expected to throw
      }

      // Assert
      expect(tokenService.getAccessTokenCalls().length).toBe(0);
    });

    it('should call verification before generating access token', async () => {
      // Arrange
      const refreshToken = RefreshTokenMother.random();

      tokenService = MockTokenGenerationService.withFailedVerification();
      sessionRefresher = new SessionRefresher(tokenService, blacklistService);

      const request = {
        refreshToken: refreshToken.value,
      };

      // Act
      try {
        await sessionRefresher.run(request);
      } catch (error) {
        // Expected to throw
      }

      // Assert
      expect(tokenService.getVerifyRefreshTokenCalls().length).toBeGreaterThan(0);
      expect(tokenService.getAccessTokenCalls().length).toBe(0);
    });
  });

  describe('Request DTO validation', () => {
    it('should convert string refresh token to RefreshToken value object', async () => {
      // Arrange
      const userId = UserIdMother.random();
      const refreshToken = RefreshTokenMother.random();

      tokenService = MockTokenGenerationService.withSuccessfulVerification(userId);
      sessionRefresher = new SessionRefresher(tokenService, blacklistService);

      const request = {
        refreshToken: refreshToken.value,
      };

      // Act
      await sessionRefresher.run(request);

      // Assert
      const verificationCalls = tokenService.getVerifyRefreshTokenCalls();
      expect(verificationCalls[0]).toBeInstanceOf(Object);
      expect(verificationCalls[0].value).toBe(refreshToken.value);
    });

    it('should accept RefreshSessionRequest with refreshToken string', async () => {
      // Arrange
      const userId = UserIdMother.random();

      tokenService = MockTokenGenerationService.withSuccessfulVerification(userId);
      sessionRefresher = new SessionRefresher(tokenService, blacklistService);

      const request = {
        refreshToken: RefreshTokenMother.validJWTValue(),
      };

      // Act & Assert - should not throw
      await expect(sessionRefresher.run(request)).resolves.not.toThrow();
    });
  });

  describe('Multiple refresh operations', () => {
    it('should handle multiple refresh operations independently', async () => {
      // Arrange
      const userId1 = UserIdMother.random();
      const userId2 = UserIdMother.random();
      const refreshToken1 = RefreshTokenMother.random();
      const refreshToken2 = RefreshTokenMother.random();
      const accessToken1 = AccessTokenMother.random();
      const accessToken2 = AccessTokenMother.random();

      const request1 = { refreshToken: refreshToken1.value };
      const request2 = { refreshToken: refreshToken2.value };

      // First refresh
      tokenService = MockTokenGenerationService.withSuccessfulVerification(userId1);
      tokenService.setAccessToken(accessToken1);
      sessionRefresher = new SessionRefresher(tokenService, blacklistService);

      const response1 = await sessionRefresher.run(request1);

      // Second refresh with different configuration
      tokenService = MockTokenGenerationService.withSuccessfulVerification(userId2);
      tokenService.setAccessToken(accessToken2);
      sessionRefresher = new SessionRefresher(tokenService, blacklistService);

      const response2 = await sessionRefresher.run(request2);

      // Assert
      expect(response1.accessToken).toBe(accessToken1.value);
      expect(response2.accessToken).toBe(accessToken2.value);
      expect(response1.accessToken).not.toBe(response2.accessToken);
    });

    it('should allow refresh after logout if not blacklisted', async () => {
      // Arrange
      const userId = UserIdMother.random();
      const refreshToken = RefreshTokenMother.random();
      const accessToken1 = AccessTokenMother.random();
      const accessToken2 = AccessTokenMother.random();

      tokenService = MockTokenGenerationService.withSuccessfulVerification(userId);
      sessionRefresher = new SessionRefresher(tokenService, blacklistService);

      const request = { refreshToken: refreshToken.value };

      // First refresh
      tokenService.setAccessToken(accessToken1);
      const response1 = await sessionRefresher.run(request);

      // Second refresh (simulating token not blacklisted)
      tokenService.setAccessToken(accessToken2);
      const response2 = await sessionRefresher.run(request);

      // Assert - both should succeed
      expect(response1.accessToken).toBe(accessToken1.value);
      expect(response2.accessToken).toBe(accessToken2.value);
    });

    it('should reject refresh if token was blacklisted between calls', async () => {
      // Arrange
      const userId = UserIdMother.random();
      const refreshToken = RefreshTokenMother.random();

      tokenService = MockTokenGenerationService.withSuccessfulVerification(userId);
      sessionRefresher = new SessionRefresher(tokenService, blacklistService);

      const request = { refreshToken: refreshToken.value };

      // First refresh succeeds
      await sessionRefresher.run(request);

      // Blacklist the token
      await blacklistService.addToBlacklist(undefined, refreshToken);

      // Act & Assert - second refresh should fail
      await expect(sessionRefresher.run(request)).rejects.toThrow(
        InvalidRefreshTokenException
      );
    });
  });

  describe('Service orchestration', () => {
    it('should execute steps in correct order: blacklist check, verify, generate', async () => {
      // Arrange
      const userId = UserIdMother.random();
      const refreshToken = RefreshTokenMother.random();
      const callOrder: string[] = [];

      // Create a custom tokenService that tracks call order
      tokenService = MockTokenGenerationService.withSuccessfulVerification(userId);
      const originalVerify = tokenService.verifyRefreshToken.bind(tokenService);
      const originalGenerate = tokenService.generateAccessToken.bind(tokenService);

      tokenService.verifyRefreshToken = async token => {
        callOrder.push('verify');
        return originalVerify(token);
      };

      tokenService.generateAccessToken = async id => {
        callOrder.push('generate');
        return originalGenerate(id);
      };

      const originalBlacklistCheck =
        blacklistService.isRefreshTokenBlacklisted.bind(blacklistService);
      blacklistService.isRefreshTokenBlacklisted = async token => {
        callOrder.push('blacklist');
        return originalBlacklistCheck(token);
      };

      sessionRefresher = new SessionRefresher(tokenService, blacklistService);

      const request = {
        refreshToken: refreshToken.value,
      };

      // Act
      await sessionRefresher.run(request);

      // Assert
      expect(callOrder).toEqual(['blacklist', 'verify', 'generate']);
    });

    it('should stop execution if token is blacklisted', async () => {
      // Arrange
      const refreshToken = RefreshTokenMother.random();

      // Add token to blacklist
      await blacklistService.addToBlacklist(undefined, refreshToken);

      const request = {
        refreshToken: refreshToken.value,
      };

      // Act
      try {
        await sessionRefresher.run(request);
      } catch (error) {
        // Expected to throw
      }

      // Assert - verify and generate should not be called
      expect(tokenService.getVerifyRefreshTokenCalls().length).toBe(0);
      expect(tokenService.getAccessTokenCalls().length).toBe(0);
    });

    it('should stop execution if verification fails', async () => {
      // Arrange
      const refreshToken = RefreshTokenMother.random();

      tokenService = MockTokenGenerationService.withFailedVerification();
      sessionRefresher = new SessionRefresher(tokenService, blacklistService);

      const request = {
        refreshToken: refreshToken.value,
      };

      // Act
      try {
        await sessionRefresher.run(request);
      } catch (error) {
        // Expected to throw
      }

      // Assert - generate should not be called
      expect(tokenService.getAccessTokenCalls().length).toBe(0);
    });
  });

  describe('Edge cases', () => {
    it('should handle same refresh token used multiple times', async () => {
      // Arrange
      const userId = UserIdMother.random();
      const refreshToken = RefreshTokenMother.random();

      tokenService = MockTokenGenerationService.withSuccessfulVerification(userId);
      sessionRefresher = new SessionRefresher(tokenService, blacklistService);

      const request = {
        refreshToken: refreshToken.value,
      };

      // Act
      const response1 = await sessionRefresher.run(request);
      const response2 = await sessionRefresher.run(request);

      // Assert - both should succeed (assuming token not blacklisted)
      expect(response1).toBeDefined();
      expect(response2).toBeDefined();
      expect(response1.expiresIn).toBe(response2.expiresIn);
    });

    it('should return new access token on each refresh', async () => {
      // Arrange
      const userId = UserIdMother.random();
      const refreshToken = RefreshTokenMother.random();

      tokenService = MockTokenGenerationService.withSuccessfulVerification(userId);
      sessionRefresher = new SessionRefresher(tokenService, blacklistService);

      const request = {
        refreshToken: refreshToken.value,
      };

      // First refresh
      const accessToken1 = AccessTokenMother.random();
      tokenService.setAccessToken(accessToken1);
      const response1 = await sessionRefresher.run(request);

      // Second refresh with different access token
      const accessToken2 = AccessTokenMother.random();
      tokenService.setAccessToken(accessToken2);
      const response2 = await sessionRefresher.run(request);

      // Assert
      expect(response1.accessToken).toBe(accessToken1.value);
      expect(response2.accessToken).toBe(accessToken2.value);
      expect(response1.accessToken).not.toBe(response2.accessToken);
    });
  });
});
