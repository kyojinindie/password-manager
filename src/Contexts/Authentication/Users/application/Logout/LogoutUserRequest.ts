/**
 * Request DTO for logout operation
 *
 * Contains the tokens that need to be invalidated during logout.
 * Both tokens are provided to ensure complete session termination.
 */
export interface LogoutUserRequest {
  /**
   * The access token to invalidate
   * Should be the JWT string currently being used for authentication
   */
  accessToken: string;

  /**
   * The refresh token to invalidate (optional)
   * If provided, will be blacklisted to prevent token refresh after logout
   */
  refreshToken?: string;
}
