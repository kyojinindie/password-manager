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
  private verifyRefreshTokenCalls: RefreshToken[] = [];
  private userIdToReturnFromVerification: UserId;
  private shouldVerificationFail: boolean = false;

  constructor(accessToken?: AccessToken, refreshToken?: RefreshToken, userId?: UserId) {
    this.accessTokenToReturn = accessToken ?? AccessTokenMother.random();
    this.refreshTokenToReturn = refreshToken ?? RefreshTokenMother.random();
    this.userIdToReturnFromVerification = userId ?? new UserId('default-user-id');
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

  public static withSuccessfulVerification(userId: UserId): MockTokenGenerationService {
    const mock = new MockTokenGenerationService(undefined, undefined, userId);
    mock.shouldVerificationFail = false;
    return mock;
  }

  public static withFailedVerification(): MockTokenGenerationService {
    const mock = new MockTokenGenerationService();
    mock.shouldVerificationFail = true;
    return mock;
  }

  public async generateAccessToken(userId: UserId): Promise<AccessToken> {
    this.generateAccessTokenCalls.push(userId);
    return this.accessTokenToReturn;
  }

  public async generateRefreshToken(userId: UserId): Promise<RefreshToken> {
    this.generateRefreshTokenCalls.push(userId);
    return this.refreshTokenToReturn;
  }

  public async verifyRefreshToken(refreshToken: RefreshToken): Promise<UserId> {
    this.verifyRefreshTokenCalls.push(refreshToken);

    if (this.shouldVerificationFail) {
      throw new Error('Invalid or expired token');
    }

    return this.userIdToReturnFromVerification;
  }

  // Test helpers
  public getAccessTokenCalls(): UserId[] {
    return this.generateAccessTokenCalls;
  }

  public getRefreshTokenCalls(): UserId[] {
    return this.generateRefreshTokenCalls;
  }

  public getVerifyRefreshTokenCalls(): RefreshToken[] {
    return this.verifyRefreshTokenCalls;
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

  public setUserIdForVerification(userId: UserId): void {
    this.userIdToReturnFromVerification = userId;
  }

  public setVerificationToFail(): void {
    this.shouldVerificationFail = true;
  }

  public setVerificationToSucceed(): void {
    this.shouldVerificationFail = false;
  }
}
