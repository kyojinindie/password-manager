import { TokenGenerationService } from '../../domain/TokenGenerationService';
import { TokenBlacklistService } from '../../domain/TokenBlacklistService';
import { RefreshToken } from '../../domain/RefreshToken';
import { InvalidRefreshTokenException } from '../../domain/InvalidRefreshTokenException';
import { AccessToken } from '../../domain/AccessToken';
import { RefreshSessionRequest } from './RefreshSessionRequest';
import { RefreshSessionResponse } from './RefreshSessionResponse';

/**
 * Application Service: SessionRefresher
 *
 * Orchestrates the session refresh operation by validating a refresh token
 * and generating a new access token to extend the user's session without
 * requiring re-authentication.
 *
 * Responsibilities:
 * - Convert DTO string to RefreshToken Value Object
 * - Verify the refresh token is not blacklisted
 * - Delegate token verification to the token service (extracts userId)
 * - Generate a new access token for the user
 * - Return the new access token with expiration info
 *
 * Does NOT:
 * - Contain business logic (only orchestration)
 * - Directly verify JWT signatures (delegates to TokenGenerationService)
 * - Access infrastructure directly
 * - Validate token format (that's done by RefreshToken Value Object)
 */
export class SessionRefresher {
  public constructor(
    private readonly tokenService: TokenGenerationService,
    private readonly tokenBlacklist: TokenBlacklistService
  ) {}

  /**
   * Execute the session refresh operation
   *
   * Orchestration flow:
   * 1. Convert refresh token string to RefreshToken VO (validates format)
   * 2. Check if refresh token is blacklisted (logged out/revoked)
   * 3. Verify and decode refresh token to extract userId
   * 4. Generate new access token for the user
   * 5. Return new access token with expiration time
   *
   * @param request - Contains the refresh token string
   * @returns Promise<RefreshSessionResponse> - New access token and expiration
   * @throws InvalidRefreshTokenException if token is invalid, expired, or blacklisted
   * @throws Error if token format is invalid (from Value Object validation)
   */
  public async run(request: RefreshSessionRequest): Promise<RefreshSessionResponse> {
    // Step 1: Convert refresh token string to RefreshToken VO
    // This validates the JWT format (throws Error if invalid)
    const refreshToken = new RefreshToken(request.refreshToken);

    // Step 2: Check if refresh token is blacklisted (user logged out)
    // Delegate to infrastructure port
    const isBlacklisted =
      await this.tokenBlacklist.isRefreshTokenBlacklisted(refreshToken);

    if (isBlacklisted) {
      // Token was revoked/blacklisted, cannot refresh
      throw new InvalidRefreshTokenException();
    }

    // Step 3: Verify refresh token and extract userId
    // Delegate to infrastructure port (verifies signature, expiration, etc.)
    // Throws InvalidRefreshTokenException if token is invalid or expired
    let userId;
    try {
      userId = await this.tokenService.verifyRefreshToken(refreshToken);
    } catch (error) {
      // Token verification failed (expired, invalid signature, etc.)
      throw new InvalidRefreshTokenException();
    }

    // Step 4: Generate new access token for the user
    // Delegate to infrastructure port
    const accessToken = await this.tokenService.generateAccessToken(userId);

    // Step 5: Return response DTO with new access token
    return {
      accessToken: accessToken.value,
      expiresIn: AccessToken.getExpirationMinutes() * 60, // Convert to seconds
    };
  }
}
