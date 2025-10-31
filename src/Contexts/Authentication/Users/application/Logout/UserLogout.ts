import { TokenBlacklistService } from '../../domain/TokenBlacklistService';
import { AccessToken } from '../../domain/AccessToken';
import { RefreshToken } from '../../domain/RefreshToken';
import { LogoutUserRequest } from './LogoutUserRequest';

/**
 * Application Service: UserLogout
 *
 * Orchestrates the logout operation by invalidating user tokens.
 * This use case ensures that both access and refresh tokens are blacklisted
 * to prevent their reuse after the user logs out.
 *
 * Responsibilities:
 * - Convert DTO strings to domain Value Objects
 * - Delegate token invalidation to the blacklist service
 * - Return void (operation has no response data)
 *
 * Does NOT:
 * - Contain business logic (only orchestration)
 * - Access infrastructure directly
 * - Validate token format (that's done by Value Objects)
 */
export class UserLogout {
  public constructor(private readonly tokenBlacklistService: TokenBlacklistService) {}

  /**
   * Execute the logout operation
   *
   * @param request - Contains the tokens to invalidate
   * @returns Promise<void> - No response data needed (204 No Content)
   * @throws Error if token format is invalid (from Value Object validation)
   */
  public async run(request: LogoutUserRequest): Promise<void> {
    // Step 1: Convert access token string to AccessToken VO
    // This validates the token format
    const accessToken = new AccessToken(request.accessToken);

    // Step 2: Convert refresh token string to RefreshToken VO if provided
    const refreshToken = request.refreshToken
      ? new RefreshToken(request.refreshToken)
      : undefined;

    // Step 3: Blacklist both tokens in a single call
    // Delegates to infrastructure port
    await this.tokenBlacklistService.addToBlacklist(accessToken, refreshToken);

    // Step 4: Return void (no response data)
    // HTTP layer will return 204 No Content
  }
}
