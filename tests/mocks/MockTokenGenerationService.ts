import { TokenGenerationService } from '../../src/Contexts/Authentication/Users/domain/TokenGenerationService';
import { AccessToken } from '../../src/Contexts/Authentication/Users/domain/AccessToken';
import { RefreshToken } from '../../src/Contexts/Authentication/Users/domain/RefreshToken';
import { UserId } from '../../src/Contexts/Authentication/Users/domain/UserId';
import { AccessTokenMother } from '../mothers/AccessTokenMother';
import { RefreshTokenMother } from '../mothers/RefreshTokenMother';

export class MockTokenGenerationService implements TokenGenerationService {
  private accessTokenToReturn: AccessToken;
  private refreshTokenToReturn: RefreshToken;
  private generateAccessTokenCalls: UserId[] = [];
  private generateRefreshTokenCalls: UserId[] = [];

  constructor(accessToken?: AccessToken, refreshToken?: RefreshToken) {
    this.accessTokenToReturn = accessToken ?? AccessTokenMother.random();
    this.refreshTokenToReturn = refreshToken ?? RefreshTokenMother.random();
  }

  public static withTokens(
    accessToken: AccessToken,
    refreshToken: RefreshToken
  ): MockTokenGenerationService {
    return new MockTokenGenerationService(accessToken, refreshToken);
  }

  public static withDefaultTokens(): MockTokenGenerationService {
    return new MockTokenGenerationService();
  }

  public async generateAccessToken(userId: UserId): Promise<AccessToken> {
    this.generateAccessTokenCalls.push(userId);
    return this.accessTokenToReturn;
  }

  public async generateRefreshToken(userId: UserId): Promise<RefreshToken> {
    this.generateRefreshTokenCalls.push(userId);
    return this.refreshTokenToReturn;
  }

  // Test helpers
  public getAccessTokenCalls(): UserId[] {
    return this.generateAccessTokenCalls;
  }

  public getRefreshTokenCalls(): UserId[] {
    return this.generateRefreshTokenCalls;
  }

  public wasCalledWithUserId(userId: UserId): boolean {
    return this.generateAccessTokenCalls.some(id => id.equals(userId));
  }

  public setAccessToken(token: AccessToken): void {
    this.accessTokenToReturn = token;
  }

  public setRefreshToken(token: RefreshToken): void {
    this.refreshTokenToReturn = token;
  }
}
