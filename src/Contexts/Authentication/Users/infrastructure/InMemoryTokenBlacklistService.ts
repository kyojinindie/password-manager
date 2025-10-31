import { TokenBlacklistService } from '../domain/TokenBlacklistService';
import { AccessToken } from '../domain/AccessToken';
import { RefreshToken } from '../domain/RefreshToken';

/**
 * In-Memory Token Blacklist Service - Secondary Adapter
 *
 * Implements the TokenBlacklistService port defined by the domain layer.
 * This adapter provides a simple in-memory storage for blacklisted tokens.
 *
 * Architecture Notes:
 * - This is a SECONDARY (driven/output) adapter in Hexagonal Architecture
 * - It implements the domain port (interface) without the domain knowing about Map
 * - All implementation details (Map storage) are hidden from the domain
 * - This is a TEMPORARY implementation - will be replaced with Redis later
 *
 * Responsibilities:
 * - Store blacklisted access tokens in memory
 * - Store blacklisted refresh tokens in memory
 * - Provide fast lookup to check if token is blacklisted
 * - Automatically clean up expired tokens (optional optimization)
 *
 * Technology Encapsulation:
 * - Domain doesn't know we're using Map for storage
 * - Domain only knows about the TokenBlacklistService interface
 * - If we switch to Redis, only this file changes
 *
 * Limitations (In-Memory Storage):
 * - Data is lost on server restart
 * - Not suitable for multi-instance deployments (no shared state)
 * - No persistence across processes
 * - Memory consumption grows over time (until tokens expire)
 *
 * Production Considerations:
 * - Replace with RedisTokenBlacklistService for production
 * - Consider implementing automatic cleanup of expired tokens
 * - Monitor memory usage in production
 */
export class InMemoryTokenBlacklistService implements TokenBlacklistService {
  /**
   * In-memory storage for blacklisted access tokens
   * Key: token string value
   * Value: expiration date (for potential cleanup)
   */
  private readonly blacklistedAccessTokens: Map<string, Date> = new Map();

  /**
   * In-memory storage for blacklisted refresh tokens
   * Key: token string value
   * Value: expiration date (for potential cleanup)
   */
  private readonly blacklistedRefreshTokens: Map<string, Date> = new Map();

  /**
   * Adds tokens to the blacklist
   *
   * This method stores tokens in memory, making them invalid for future authentication.
   * At least one token (accessToken or refreshToken) must be provided.
   *
   * Use cases:
   * - User logout: blacklist both access and refresh tokens
   * - Token refresh: blacklist only the old refresh token
   * - Security incident: blacklist specific tokens
   *
   * @param accessToken - Optional access token to blacklist
   * @param refreshToken - Optional refresh token to blacklist
   *
   * @throws Error if both tokens are undefined/null
   *
   * Storage strategy:
   * - Uses token.value as key for fast O(1) lookup
   * - Stores token's natural expiration for potential cleanup
   * - Tokens remain blacklisted until expiration or server restart
   */
  public async addToBlacklist(
    accessToken?: AccessToken,
    refreshToken?: RefreshToken
  ): Promise<void> {
    // Validate that at least one token is provided
    if (!accessToken && !refreshToken) {
      throw new Error(
        'At least one token (accessToken or refreshToken) must be provided to blacklist'
      );
    }

    // Add access token to blacklist if provided
    if (accessToken) {
      // Calculate expiration date from AccessToken VO
      const expirationMinutes = AccessToken.getExpirationMinutes();
      const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);

      this.blacklistedAccessTokens.set(accessToken.value, expiresAt);
    }

    // Add refresh token to blacklist if provided
    if (refreshToken) {
      // Calculate expiration date from RefreshToken VO
      const expirationDays = RefreshToken.getExpirationDays();
      const expiresAt = new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000);

      this.blacklistedRefreshTokens.set(refreshToken.value, expiresAt);
    }

    // Await to satisfy async function requirement
    await Promise.resolve();
  }

  /**
   * Checks if an access token is blacklisted
   *
   * This method performs a fast O(1) lookup in the in-memory Map.
   *
   * @param accessToken - The access token to check
   * @returns true if token is blacklisted, false otherwise
   *
   * Usage:
   * - Called by authentication middleware on each request
   * - Should be very fast (O(1) lookup)
   * - No network calls (in-memory)
   */
  public async isAccessTokenBlacklisted(accessToken: AccessToken): Promise<boolean> {
    const expiresAt = this.blacklistedAccessTokens.get(accessToken.value);

    // Token not in blacklist
    if (!expiresAt) {
      return false;
    }

    // Check if token expiration has passed
    const now = new Date();
    if (now > expiresAt) {
      // Token has expired, remove from blacklist (cleanup)
      this.blacklistedAccessTokens.delete(accessToken.value);
      return false;
    }

    // Token is blacklisted and still valid
    // Await to satisfy async function requirement
    return await Promise.resolve(true);
  }

  /**
   * Checks if a refresh token is blacklisted
   *
   * This method performs a fast O(1) lookup in the in-memory Map.
   *
   * @param refreshToken - The refresh token to check
   * @returns true if token is blacklisted, false otherwise
   *
   * Usage:
   * - Called during token refresh flow
   * - Should be very fast (O(1) lookup)
   * - No network calls (in-memory)
   */
  public async isRefreshTokenBlacklisted(refreshToken: RefreshToken): Promise<boolean> {
    const expiresAt = this.blacklistedRefreshTokens.get(refreshToken.value);

    // Token not in blacklist
    if (!expiresAt) {
      return false;
    }

    // Check if token expiration has passed
    const now = new Date();
    if (now > expiresAt) {
      // Token has expired, remove from blacklist (cleanup)
      this.blacklistedRefreshTokens.delete(refreshToken.value);
      return false;
    }

    // Token is blacklisted and still valid
    // Await to satisfy async function requirement
    return await Promise.resolve(true);
  }

  /**
   * Gets the current size of the blacklist (for monitoring)
   *
   * This method is useful for:
   * - Monitoring memory usage
   * - Debugging
   * - Health checks
   *
   * @returns Object with counts of blacklisted tokens
   */
  public getBlacklistSize(): { accessTokens: number; refreshTokens: number } {
    return {
      accessTokens: this.blacklistedAccessTokens.size,
      refreshTokens: this.blacklistedRefreshTokens.size,
    };
  }

  /**
   * Clears all blacklisted tokens (for testing purposes)
   *
   * WARNING: This method should only be used in tests!
   * In production, use a scheduled cleanup job instead.
   */
  public clear(): void {
    this.blacklistedAccessTokens.clear();
    this.blacklistedRefreshTokens.clear();
  }

  /**
   * Removes expired tokens from the blacklist (optional cleanup)
   *
   * This method can be called periodically to free up memory.
   * Consider running this as a scheduled job (e.g., every hour).
   *
   * @returns Number of tokens removed
   */
  public async cleanupExpiredTokens(): Promise<number> {
    let removedCount = 0;
    const now = new Date();

    // Cleanup access tokens
    for (const [token, expiresAt] of this.blacklistedAccessTokens.entries()) {
      if (now > expiresAt) {
        this.blacklistedAccessTokens.delete(token);
        removedCount++;
      }
    }

    // Cleanup refresh tokens
    for (const [token, expiresAt] of this.blacklistedRefreshTokens.entries()) {
      if (now > expiresAt) {
        this.blacklistedRefreshTokens.delete(token);
        removedCount++;
      }
    }

    // Await to satisfy async function requirement
    return await Promise.resolve(removedCount);
  }
}
