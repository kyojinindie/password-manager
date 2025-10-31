import { UserLogout } from '../../../../../../src/Contexts/Authentication/Users/application/Logout/UserLogout';
import { MockTokenBlacklistService } from '../../../../../mocks/MockTokenBlacklistService';
import { AccessTokenMother } from '../../../../../mothers/AccessTokenMother';
import { RefreshTokenMother } from '../../../../../mothers/RefreshTokenMother';

describe('UserLogout', () => {
  let userLogout: UserLogout;
  let blacklistService: MockTokenBlacklistService;

  beforeEach(() => {
    blacklistService = new MockTokenBlacklistService();
    userLogout = new UserLogout(blacklistService);
  });

  afterEach(() => {
    blacklistService.clear();
  });

  describe('Successful logout', () => {
    it('should logout successfully with access token only', async () => {
      // Arrange
      const accessToken = AccessTokenMother.random();
      const request = {
        accessToken: accessToken.value,
      };

      // Act
      await userLogout.run(request);

      // Assert
      expect(blacklistService.getAddToBlacklistCalls().length).toBe(1);
      expect(blacklistService.wasCalledWithAccessToken(accessToken)).toBe(true);
    });

    it('should logout successfully with both access and refresh tokens', async () => {
      // Arrange
      const accessToken = AccessTokenMother.random();
      const refreshToken = RefreshTokenMother.random();
      const request = {
        accessToken: accessToken.value,
        refreshToken: refreshToken.value,
      };

      // Act
      await userLogout.run(request);

      // Assert
      expect(blacklistService.getAddToBlacklistCalls().length).toBe(1);
      expect(blacklistService.wasCalledWithAccessToken(accessToken)).toBe(true);
      expect(blacklistService.wasCalledWithRefreshToken(refreshToken)).toBe(true);
    });

    it('should add access token to blacklist when provided', async () => {
      // Arrange
      const accessToken = AccessTokenMother.random();
      const request = {
        accessToken: accessToken.value,
      };

      // Act
      await userLogout.run(request);

      // Assert
      const blacklistedTokens = blacklistService.getBlacklistedAccessTokens();
      expect(blacklistedTokens.length).toBe(1);
      expect(blacklistedTokens[0].equals(accessToken)).toBe(true);
    });

    it('should add refresh token to blacklist when provided', async () => {
      // Arrange
      const accessToken = AccessTokenMother.random();
      const refreshToken = RefreshTokenMother.random();
      const request = {
        accessToken: accessToken.value,
        refreshToken: refreshToken.value,
      };

      // Act
      await userLogout.run(request);

      // Assert
      const blacklistedRefreshTokens = blacklistService.getBlacklistedRefreshTokens();
      expect(blacklistedRefreshTokens.length).toBe(1);
      expect(blacklistedRefreshTokens[0].equals(refreshToken)).toBe(true);
    });

    it('should call blacklist service exactly once', async () => {
      // Arrange
      const accessToken = AccessTokenMother.random();
      const refreshToken = RefreshTokenMother.random();
      const request = {
        accessToken: accessToken.value,
        refreshToken: refreshToken.value,
      };

      // Act
      await userLogout.run(request);

      // Assert
      expect(blacklistService.getAddToBlacklistCalls().length).toBe(1);
    });
  });

  describe('Token validation', () => {
    it('should handle logout with only access token (no refresh token)', async () => {
      // Arrange
      const accessToken = AccessTokenMother.random();
      const request = {
        accessToken: accessToken.value,
        // refreshToken is intentionally omitted
      };

      // Act
      await userLogout.run(request);

      // Assert
      expect(blacklistService.getBlacklistedAccessTokens().length).toBe(1);
      expect(blacklistService.getBlacklistedRefreshTokens().length).toBe(0);
    });

    it('should convert string access token to AccessToken value object', async () => {
      // Arrange
      const accessToken = AccessTokenMother.random();
      const request = {
        accessToken: accessToken.value,
      };

      // Act
      await userLogout.run(request);

      // Assert
      const blacklistedTokens = blacklistService.getBlacklistedAccessTokens();
      expect(blacklistedTokens[0]).toBeInstanceOf(Object);
      expect(blacklistedTokens[0].value).toBe(accessToken.value);
    });

    it('should convert string refresh token to RefreshToken value object when provided', async () => {
      // Arrange
      const accessToken = AccessTokenMother.random();
      const refreshToken = RefreshTokenMother.random();
      const request = {
        accessToken: accessToken.value,
        refreshToken: refreshToken.value,
      };

      // Act
      await userLogout.run(request);

      // Assert
      const blacklistedRefreshTokens = blacklistService.getBlacklistedRefreshTokens();
      expect(blacklistedRefreshTokens[0]).toBeInstanceOf(Object);
      expect(blacklistedRefreshTokens[0].value).toBe(refreshToken.value);
    });
  });

  describe('Blacklist service integration', () => {
    it('should pass both tokens to blacklist service in a single call', async () => {
      // Arrange
      const accessToken = AccessTokenMother.random();
      const refreshToken = RefreshTokenMother.random();
      const request = {
        accessToken: accessToken.value,
        refreshToken: refreshToken.value,
      };

      // Act
      await userLogout.run(request);

      // Assert
      const calls = blacklistService.getAddToBlacklistCalls();
      expect(calls.length).toBe(1);
      expect(calls[0].accessToken).toBeDefined();
      expect(calls[0].refreshToken).toBeDefined();
      expect(calls[0].accessToken?.equals(accessToken)).toBe(true);
      expect(calls[0].refreshToken?.equals(refreshToken)).toBe(true);
    });

    it('should pass only access token when refresh token is not provided', async () => {
      // Arrange
      const accessToken = AccessTokenMother.random();
      const request = {
        accessToken: accessToken.value,
      };

      // Act
      await userLogout.run(request);

      // Assert
      const calls = blacklistService.getAddToBlacklistCalls();
      expect(calls.length).toBe(1);
      expect(calls[0].accessToken).toBeDefined();
      expect(calls[0].refreshToken).toBeUndefined();
    });
  });

  describe('Request DTO validation', () => {
    it('should accept LogoutUserRequest with only accessToken', async () => {
      // Arrange
      const request = {
        accessToken: AccessTokenMother.validJWTValue(),
      };

      // Act & Assert - should not throw
      await expect(userLogout.run(request)).resolves.not.toThrow();
    });

    it('should accept LogoutUserRequest with both tokens', async () => {
      // Arrange
      const request = {
        accessToken: AccessTokenMother.validJWTValue(),
        refreshToken: RefreshTokenMother.validJWTValue(),
      };

      // Act & Assert - should not throw
      await expect(userLogout.run(request)).resolves.not.toThrow();
    });
  });

  describe('Multiple logout operations', () => {
    it('should handle multiple logout operations independently', async () => {
      // Arrange
      const accessToken1 = AccessTokenMother.random();
      const accessToken2 = AccessTokenMother.random();

      const request1 = { accessToken: accessToken1.value };
      const request2 = { accessToken: accessToken2.value };

      // Act
      await userLogout.run(request1);
      await userLogout.run(request2);

      // Assert
      expect(blacklistService.getAddToBlacklistCalls().length).toBe(2);
      expect(blacklistService.getBlacklistedAccessTokens().length).toBe(2);
      expect(blacklistService.wasCalledWithAccessToken(accessToken1)).toBe(true);
      expect(blacklistService.wasCalledWithAccessToken(accessToken2)).toBe(true);
    });

    it('should blacklist different token pairs correctly', async () => {
      // Arrange
      const accessToken1 = AccessTokenMother.random();
      const refreshToken1 = RefreshTokenMother.random();
      const accessToken2 = AccessTokenMother.random();
      const refreshToken2 = RefreshTokenMother.random();

      const request1 = {
        accessToken: accessToken1.value,
        refreshToken: refreshToken1.value,
      };
      const request2 = {
        accessToken: accessToken2.value,
        refreshToken: refreshToken2.value,
      };

      // Act
      await userLogout.run(request1);
      await userLogout.run(request2);

      // Assert
      expect(blacklistService.getBlacklistedAccessTokens().length).toBe(2);
      expect(blacklistService.getBlacklistedRefreshTokens().length).toBe(2);
    });
  });
});
