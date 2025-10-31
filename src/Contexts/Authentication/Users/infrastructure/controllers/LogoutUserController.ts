import { Request, Response } from 'express';
import { UserLogout } from '../../application/Logout/UserLogout';
import { LogoutUserRequest } from '../../application/Logout/LogoutUserRequest';

/**
 * Logout User Controller - Primary Adapter
 *
 * HTTP controller that handles user logout requests.
 * This is a PRIMARY (driving/input) adapter in Hexagonal Architecture.
 *
 * Architecture Notes:
 * - This adapter translates HTTP requests into application layer calls
 * - It has ZERO business logic - only HTTP/protocol concerns
 * - It delegates ALL business logic to the UserLogout use case
 * - It extracts tokens from HTTP headers/body
 *
 * Responsibilities (Thin Controller):
 * 1. Extract tokens from request (Authorization header and optionally body)
 * 2. Validate request format (not business rules)
 * 3. Delegate to application service (UserLogout)
 * 4. Return appropriate HTTP status code
 * 5. Handle errors and map to HTTP responses
 *
 * What this controller DOES NOT do:
 * - Token validation (that's checked by domain/infrastructure)
 * - Blacklisting logic (that's in use case)
 * - Token verification (that could be in middleware)
 *
 * Authentication:
 * - This endpoint REQUIRES authentication (use middleware)
 * - The access token is extracted from Authorization header
 * - Optionally, refresh token can be provided in request body
 *
 * Dependency Injection:
 * - Receives UserLogout use case as constructor dependency
 * - This allows easy testing with mocks
 * - This allows swapping implementations without changing controller
 */
export class LogoutUserController {
  public constructor(private readonly userLogout: UserLogout) {}

  /**
   * Handles POST /auth/logout requests
   *
   * Request headers:
   * Authorization: Bearer <access-token>
   *
   * Request body (optional):
   * {
   *   "refreshToken": "jwt-refresh-token"  // Optional
   * }
   *
   * Success response (204 No Content):
   * - No body returned
   * - Status 204 indicates successful logout
   *
   * Error responses:
   * - 400 Bad Request: Missing Authorization header
   * - 401 Unauthorized: Invalid token format
   * - 500 Internal Server Error: Unexpected error
   *
   * Flow:
   * 1. Extract access token from Authorization header
   * 2. Extract optional refresh token from body
   * 3. Call UserLogout use case to blacklist tokens
   * 4. Return 204 No Content
   */
  public async run(req: Request, res: Response): Promise<void> {
    try {
      // Step 1: Extract and validate access token from Authorization header
      const accessToken = this.extractAccessTokenFromHeader(req);
      if (!accessToken) {
        res.status(401).json({
          error: 'Unauthorized',
          message:
            'Missing or invalid Authorization header. Expected format: "Bearer <token>"',
        });
        return;
      }

      // Step 2: Extract optional refresh token from request body
      const refreshToken = this.extractRefreshTokenFromBody(req);

      // Step 3: Build application DTO from HTTP request
      const logoutRequest: LogoutUserRequest = {
        accessToken,
        refreshToken: refreshToken || undefined,
      };

      // Step 4: Delegate to application service (use case)
      await this.userLogout.run(logoutRequest);

      // Step 5: Return success response (204 No Content)
      // No body is needed - 204 status code indicates successful logout
      res.status(204).send();
    } catch (error) {
      // Step 6: Handle and translate errors to HTTP responses
      this.handleError(error, res);
    }
  }

  /**
   * Extracts the access token from the Authorization header
   *
   * Expected header format:
   * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   *
   * @param req - Express request object
   * @returns The access token string, or null if not found/invalid
   *
   * Validation performed:
   * - Header exists
   * - Header starts with "Bearer "
   * - Token part is not empty
   *
   * What this method DOES NOT do:
   * - Verify JWT signature (that's in domain/infrastructure)
   * - Check token expiration (that's in domain)
   * - Validate token payload (that's in domain)
   */
  private extractAccessTokenFromHeader(req: Request): string | null {
    // Get Authorization header
    const authHeader = req.headers.authorization;

    // Check if header exists
    if (!authHeader) {
      return null;
    }

    // Check if header starts with "Bearer "
    if (!authHeader.startsWith('Bearer ')) {
      return null;
    }

    // Extract token part (after "Bearer ")
    const token = authHeader.substring(7).trim();

    // Check if token is not empty
    if (token.length === 0) {
      return null;
    }

    return token;
  }

  /**
   * Extracts the optional refresh token from the request body
   *
   * Expected body format:
   * {
   *   "refreshToken": "jwt-refresh-token-string"
   * }
   *
   * @param req - Express request object
   * @returns The refresh token string, or null if not provided
   *
   * Notes:
   * - Refresh token is OPTIONAL
   * - If provided, it will be blacklisted along with access token
   * - If not provided, only access token is blacklisted
   */
  private extractRefreshTokenFromBody(req: Request): string | null {
    // Check if body exists and has refreshToken field
    if (!req.body || typeof req.body !== 'object') {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { refreshToken } = req.body;

    // Check if refreshToken is a non-empty string
    if (!refreshToken || typeof refreshToken !== 'string') {
      return null;
    }

    if (refreshToken.trim().length === 0) {
      return null;
    }

    return refreshToken.trim();
  }

  /**
   * Maps errors to appropriate HTTP status codes
   *
   * Error mapping strategy:
   * - Invalid token format errors → 400 Bad Request
   * - Unknown errors → 500 Internal Server Error
   *
   * Security notes:
   * - Don't expose internal error details to clients
   * - Log full errors server-side for debugging
   * - Return user-friendly messages in responses
   *
   * Why logout rarely fails:
   * - Logout is a simple operation (just blacklist tokens)
   * - Most errors would be infrastructure issues (DB, Redis down)
   * - Invalid tokens are still blacklisted (idempotent operation)
   *
   * @param error - The error to handle
   * @param res - Express response object
   */
  private handleError(error: unknown, res: Response): void {
    // Log full error for debugging (in production, use proper logger)
    console.error('[LogoutUserController] Error:', error);

    // Check if error is from Value Object validation (AccessToken, RefreshToken)
    if (error instanceof Error && error.message.includes('Invalid token format')) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid token format provided',
      });
      return;
    }

    // Unknown error - don't expose details to client
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred during logout. Please try again later.',
    });
  }
}
