import { Request, Response } from 'express';
import { UserLogin } from '../../application/Login/UserLogin';
import { LoginUserRequest } from '../../application/Login/LoginUserRequest';
import { InvalidCredentialsException } from '../../domain/InvalidCredentialsException';
import { AccountLockedException } from '../../domain/AccountLockedException';
import { InactiveUserException } from '../../domain/InactiveUserException';

/**
 * Login User Controller - Primary Adapter
 *
 * HTTP controller that handles user login requests.
 * This is a PRIMARY (driving/input) adapter in Hexagonal Architecture.
 *
 * Architecture Notes:
 * - This adapter translates HTTP requests into application layer calls
 * - It has ZERO business logic - only HTTP/protocol concerns
 * - It delegates ALL business logic to the UserLogin use case
 * - It maps domain exceptions to appropriate HTTP status codes
 *
 * Responsibilities (Thin Controller):
 * 1. Extract and validate request format (not business rules)
 * 2. Delegate to application service (UserLogin)
 * 3. Format response for HTTP
 * 4. Handle errors and map to HTTP status codes
 *
 * What this controller DOES NOT do:
 * - Business validation (that's in domain/application)
 * - Password verification (that's in domain)
 * - Token generation (that's in infrastructure service)
 * - User retrieval (that's in repository)
 *
 * Dependency Injection:
 * - Receives UserLogin use case as constructor dependency
 * - This allows easy testing with mocks
 * - This allows swapping implementations without changing controller
 */
export class LoginUserController {
  public constructor(private readonly userLogin: UserLogin) {}

  /**
   * Handles POST /auth/login requests
   *
   * Request body:
   * {
   *   "email": "user@example.com",
   *   "masterPassword": "SecurePass123!"
   * }
   *
   * Success response (201):
   * {
   *   "userId": "uuid",
   *   "accessToken": "jwt-token",
   *   "refreshToken": "jwt-refresh-token",
   *   "expiresIn": 900
   * }
   *
   * Error responses:
   * - 400: Missing required fields
   * - 401: Invalid credentials
   * - 403: Inactive user account
   * - 423: Account locked due to failed attempts
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
      const { email, masterPassword } = req.body;
      const loginRequest: LoginUserRequest = {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        email,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        masterPassword,
      };

      // Step 3: Delegate to application service (use case)
      const loginResponse = await this.userLogin.run(loginRequest);

      // Step 4: Return formatted HTTP response
      res.status(200).json({
        userId: loginResponse.userId,
        accessToken: loginResponse.accessToken,
        refreshToken: loginResponse.refreshToken,
        expiresIn: loginResponse.expiresIn,
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
   * - Basic format (e.g., email has @ symbol)
   *
   * Does NOT check:
   * - Email exists in database (that's application/domain)
   * - Password is correct (that's domain)
   * - User is active (that's domain)
   *
   * @param body - Request body to validate
   * @returns Error message if invalid, null if valid
   */
  private validateRequestFormat(body: Record<string, unknown>): string | null {
    // Check email field
    if (!body.email) {
      return 'Email is required';
    }

    if (typeof body.email !== 'string') {
      return 'Email must be a string';
    }

    if (!body.email.includes('@')) {
      return 'Email must be a valid email format';
    }

    // Check masterPassword field
    if (!body.masterPassword) {
      return 'Master password is required';
    }

    if (typeof body.masterPassword !== 'string') {
      return 'Master password must be a string';
    }

    // All format validations passed
    return null;
  }

  /**
   * Maps domain exceptions to appropriate HTTP status codes
   *
   * Error mapping strategy:
   * - InvalidCredentialsException → 401 Unauthorized
   * - AccountLockedException → 423 Locked
   * - InactiveUserException → 403 Forbidden
   * - Unknown errors → 500 Internal Server Error
   *
   * Security note:
   * - Don't expose internal error details to clients
   * - Log full errors server-side for debugging
   * - Return user-friendly messages in responses
   *
   * @param error - The error to handle
   * @param res - Express response object
   */
  private handleError(error: unknown, res: Response): void {
    // Log full error for debugging (in production, use proper logger)
    console.error('[LoginUserController] Error:', error);

    // Map domain exceptions to HTTP responses
    if (error instanceof InvalidCredentialsException) {
      res.status(401).json({
        error: 'Unauthorized',
        message: error.message,
      });
      return;
    }

    if (error instanceof AccountLockedException) {
      res.status(423).json({
        error: 'Locked',
        message: error.message,
      });
      return;
    }

    if (error instanceof InactiveUserException) {
      res.status(403).json({
        error: 'Forbidden',
        message: error.message,
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
