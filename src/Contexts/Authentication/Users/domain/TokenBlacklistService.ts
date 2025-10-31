import { AccessToken } from './AccessToken';
import { RefreshToken } from './RefreshToken';

/**
 * Port for token invalidation service
 *
 * This service is responsible for blacklisting tokens to prevent their reuse
 * after logout. Infrastructure layer will provide the concrete implementation
 * (Redis, Database, In-Memory, etc.)
 */
export interface TokenBlacklistService {
  /**
   * Blacklist tokens to prevent their further use
   *
   * At least one token (accessToken or refreshToken) must be provided.
   * Both can be provided to blacklist the entire user session.
   *
   * @param accessToken - Optional access token to invalidate
   * @param refreshToken - Optional refresh token to invalidate
   * @returns Promise that resolves when tokens are blacklisted
   */
  addToBlacklist(accessToken?: AccessToken, refreshToken?: RefreshToken): Promise<void>;

  /**
   * Check if an access token is blacklisted
   *
   * @param accessToken - The access token to check
   * @returns Promise that resolves to true if blacklisted, false otherwise
   */
  isAccessTokenBlacklisted(accessToken: AccessToken): Promise<boolean>;

  /**
   * Check if a refresh token is blacklisted
   *
   * @param refreshToken - The refresh token to check
   * @returns Promise that resolves to true if blacklisted, false otherwise
   */
  isRefreshTokenBlacklisted(refreshToken: RefreshToken): Promise<boolean>;
}
