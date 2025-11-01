import { Request, Response } from 'express';
import { SessionRefresher } from '../../application/RefreshSession/SessionRefresher';
import { RefreshSessionRequest } from '../../application/RefreshSession/RefreshSessionRequest';
import { InvalidRefreshTokenException } from '../../domain/InvalidRefreshTokenException';

/**
 * Refresh Session Controller - Primary Adapter
 *
 * HTTP controller that handles session refresh requests.
 * This is a PRIMARY (driving/input) adapter in Hexagonal Architecture.
 *
 * Architecture Notes:
 * - This adapter translates HTTP requests into application layer calls
 * - It has ZERO business logic - only HTTP/protocol concerns
 * - It delegates ALL business logic to the SessionRefresher use case
 * - It maps domain exceptions to appropriate HTTP status codes
 *
 * Responsibilities (Thin Controller):
 * 1. Extract and validate request format (not business rules)
 * 2. Delegate to application service (SessionRefresher)
 * 3. Format response for HTTP
 * 4. Handle errors and map to HTTP status codes
 *
 * What this controller DOES NOT do:
 * - Token verification (that's in domain/infrastructure)
 * - Token generation (that's in infrastructure service)
 * - Blacklist checking (that's in use case/infrastructure)
 * - Business validation (that's in domain/application)
 *
 * Dependency Injection:
 * - Receives SessionRefresher use case as constructor dependency
 * - This allows easy testing with mocks
 * - This allows swapping implementations without changing controller
 */
export class RefreshSessionController {
  public constructor(private readonly sessionRefresher: SessionRefresher) {}

  /**
   * Handles POST /auth/refresh requests
   *
   * Request body:
   * {
   *   "refreshToken": "jwt-refresh-token-here"
   * }
   *
   * Success response (200):
   * {
   *   "accessToken": "new-jwt-access-token",
   *   "expiresIn": 900
   * }
   *
   * Error responses:
   * - 400: Missing refreshToken field
   * - 401: Invalid, expired, or revoked refresh token
   * - 500: Internal server error
   */
  public async run(req: Request, res: Response): Promise<void> {
    try {
      // Step 1: Validate input format (not business rules)
      const validationError = this.validateRequestFormat(
        req.body as Record<string, unknown>
      );
      if (validationError) {
        res.status(400).json({
          error: 'Bad Request',
          message: validationError,
        });
        return;
      }

      // Step 2: Build application DTO from HTTP request
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { refreshToken } = req.body;
      const refreshRequest: RefreshSessionRequest = {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        refreshToken,
      };

      // Step 3: Delegate to application service (use case)
      const refreshResponse = await this.sessionRefresher.run(refreshRequest);

      // Step 4: Return formatted HTTP response
      res.status(200).json({
        accessToken: refreshResponse.accessToken,
        expiresIn: refreshResponse.expiresIn,
      });
    } catch (error) {
      // Step 5: Handle and translate errors to HTTP responses
      this.handleError(error, res);
    }
  }

  /**
   * Validates request format (NOT business rules)
   *
   * Only checks:
   * - Required fields are present
   * - Fields are of expected type
   *
   * Does NOT check:
   * - Token validity (that's application/domain)
   * - Token expiration (that's domain)
   * - Token blacklist status (that's application/infrastructure)
   *
   * @param body - Request body to validate
   * @returns Error message if invalid, null if valid
   */
  private validateRequestFormat(body: Record<string, unknown>): string | null {
    // Check refreshToken field
    if (!body.refreshToken) {
      return 'Refresh token is required';
    }

    if (typeof body.refreshToken !== 'string') {
      return 'Refresh token must be a string';
    }

    if (body.refreshToken.trim().length === 0) {
      return 'Refresh token cannot be empty';
    }

    // All format validations passed
    return null;
  }

  /**
   * Maps domain exceptions to appropriate HTTP status codes
   *
   * Error mapping strategy:
   * - InvalidRefreshTokenException → 401 Unauthorized
   * - Invalid token format (from VO) → 401 Unauthorized
   * - Unknown errors → 500 Internal Server Error
   *
   * Security note:
   * - Don't expose internal error details to clients
   * - Log full errors server-side for debugging
   * - Return user-friendly messages in responses
   * - All token-related errors map to 401 to avoid information leakage
   *
   * @param error - The error to handle
   * @param res - Express response object
   */
  private handleError(error: unknown, res: Response): void {
    // Log full error for debugging (in production, use proper logger)
    console.error('[RefreshSessionController] Error:', error);

    // Map domain exceptions to HTTP responses
    if (error instanceof InvalidRefreshTokenException) {
      res.status(401).json({
        error: 'Unauthorized',
        message: error.message,
      });
      return;
    }

    // Check if error is from Value Object validation (RefreshToken)
    if (error instanceof Error && error.message.includes('Invalid token format')) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'The provided refresh token is invalid',
      });
      return;
    }

    // Unknown error - don't expose details to client
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred. Please try again later.',
    });
  }
}
