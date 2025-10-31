import { TokenBlacklistService } from '../../src/Contexts/Authentication/Users/domain/TokenBlacklistService';
import { AccessToken } from '../../src/Contexts/Authentication/Users/domain/AccessToken';
import { RefreshToken } from '../../src/Contexts/Authentication/Users/domain/RefreshToken';

export class MockTokenBlacklistService implements TokenBlacklistService {
  private blacklistedAccessTokens: AccessToken[] = [];
  private blacklistedRefreshTokens: RefreshToken[] = [];
  private addToBlacklistCalls: Array<{
    accessToken?: AccessToken;
    refreshToken?: RefreshToken;
  }> = [];

  public async addToBlacklist(
    accessToken?: AccessToken,
    refreshToken?: RefreshToken
  ): Promise<void> {
    this.addToBlacklistCalls.push({ accessToken, refreshToken });

    if (accessToken) {
      this.blacklistedAccessTokens.push(accessToken);
    }

    if (refreshToken) {
      this.blacklistedRefreshTokens.push(refreshToken);
    }
  }

  // Test helpers
  public getBlacklistedAccessTokens(): AccessToken[] {
    return this.blacklistedAccessTokens;
  }

  public getBlacklistedRefreshTokens(): RefreshToken[] {
    return this.blacklistedRefreshTokens;
  }

  public getAddToBlacklistCalls(): Array<{
    accessToken?: AccessToken;
    refreshToken?: RefreshToken;
  }> {
    return this.addToBlacklistCalls;
  }

  public wasCalledWithAccessToken(token: AccessToken): boolean {
    return this.blacklistedAccessTokens.some(t => t.equals(token));
  }

  public wasCalledWithRefreshToken(token: RefreshToken): boolean {
    return this.blacklistedRefreshTokens.some(t => t.equals(token));
  }

  public wasCalledWith(accessToken?: AccessToken, refreshToken?: RefreshToken): boolean {
    return this.addToBlacklistCalls.some(call => {
      const accessMatches =
        !accessToken || (call.accessToken ? call.accessToken.equals(accessToken) : false);
      const refreshMatches =
        !refreshToken ||
        (call.refreshToken ? call.refreshToken.equals(refreshToken) : false);
      return accessMatches && refreshMatches;
    });
  }

  public clear(): void {
    this.blacklistedAccessTokens = [];
    this.blacklistedRefreshTokens = [];
    this.addToBlacklistCalls = [];
  }
}
