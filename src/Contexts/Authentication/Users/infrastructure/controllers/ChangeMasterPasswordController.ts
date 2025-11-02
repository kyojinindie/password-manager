import { Request, Response } from 'express';
import { MasterPasswordChanger } from '../../application/ChangeMasterPassword/MasterPasswordChanger';
import { ChangeMasterPasswordRequest } from '../../application/ChangeMasterPassword/ChangeMasterPasswordRequest';
import { InvalidCredentialsException } from '../../domain/InvalidCredentialsException';
import { UserNotFoundException } from '../../domain/UserNotFoundException';

/**
 * Change Master Password Controller - Primary Adapter
 *
 * HTTP controller that handles master password change requests.
 * This is a PRIMARY (driving/input) adapter in Hexagonal Architecture.
 *
 * Architecture Notes:
 * - This adapter translates HTTP requests into application layer calls
 * - It has ZERO business logic - only HTTP/protocol concerns
 * - It delegates ALL business logic to the MasterPasswordChanger use case
 * - It maps domain exceptions to appropriate HTTP status codes
 *
 * Responsibilities (Thin Controller):
 * 1. Extract userId from JWT token (authentication middleware)
 * 2. Validate request format (not business rules)
 * 3. Delegate to application service (MasterPasswordChanger)
 * 4. Format response for HTTP
 * 5. Handle errors and map to HTTP status codes
 *
 * What this controller DOES NOT do:
 * - Password verification (that's in domain)
 * - Password hashing (that's in domain service)
 * - Password re-encryption (that's in infrastructure service)
 * - User retrieval (that's in repository)
 * - Business validation (that's in domain/application)
 *
 * Security:
 * - This endpoint REQUIRES authentication (JWT middleware must be applied)
 * - User can only change their own password (userId from token)
 * - Current password must be verified before allowing change
 *
 * Dependency Injection:
 * - Receives MasterPasswordChanger use case as constructor dependency
 * - This allows easy testing with mocks
 * - This allows swapping implementations without changing controller
 */
export class ChangeMasterPasswordController {
  public constructor(private readonly masterPasswordChanger: MasterPasswordChanger) {}

  /**
   * Handles PUT /auth/password requests
   *
   * Request headers:
   * Authorization: Bearer <access-token>
   *
   * Request body:
   * {
   *   "currentMasterPassword": "CurrentSecurePass123!",
   *   "newMasterPassword": "NewSecurePass456!"
   * }
   *
   * Success response (200):
   * {
   *   "userId": "uuid",
   *   "passwordEntriesReEncrypted": 42,
   *   "changedAt": "2024-01-15T10:30:00.000Z"
   * }
   *
   * Error responses:
   * - 400: Missing required fields or invalid format
   * - 401: Invalid current password or missing authentication
   * - 404: User not found
   * - 500: Internal server error (re-encryption failure, etc.)
   *
   * Notes:
   * - The userId is extracted from the JWT token by authentication middleware
   * - The middleware should add userId to req.user or similar
   * - This operation may take time if user has many password entries
   * - All password entries are re-encrypted atomically
   */
  public async run(req: Request, res: Response): Promise<void> {
    try {
      // Step 1: Extract userId from authenticated request
      // Authentication middleware should have added userId to request
      const userId = this.extractUserIdFromRequest(req);
      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required. Please provide a valid access token.',
        });
        return;
      }

      // Step 2: Validate input format (not business rules)
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

      // Step 3: Build application DTO from HTTP request
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { currentMasterPassword, newMasterPassword } = req.body;
      const changePasswordRequest: ChangeMasterPasswordRequest = {
        userId,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        currentMasterPassword,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        newMasterPassword,
      };

      // Step 4: Delegate to application service (use case)
      // This orchestrates the entire change password flow including
      // password verification, validation, and re-encryption
      const changePasswordResponse =
        await this.masterPasswordChanger.run(changePasswordRequest);

      // Step 5: Return formatted HTTP response
      res.status(200).json({
        userId: changePasswordResponse.userId,
        passwordEntriesReEncrypted: changePasswordResponse.passwordEntriesReEncrypted,
        changedAt: changePasswordResponse.changedAt.toISOString(),
      });
    } catch (error) {
      // Step 6: Handle and translate errors to HTTP responses
      this.handleError(error, res);
    }
  }

  /**
   * Extracts the authenticated user's ID from the request
   *
   * The authentication middleware should have:
   * 1. Verified the JWT token
   * 2. Extracted the userId from the token payload
   * 3. Added it to req.user.userId or similar
   *
   * @param req - Express request object
   * @returns The user's ID, or null if not authenticated
   *
   * Note: The exact location depends on your authentication middleware
   * Common patterns:
   * - req.user.userId (if middleware adds user object)
   * - req.userId (if middleware adds directly)
   * - req.auth.userId (if using express-jwt)
   */
  private extractUserIdFromRequest(req: Request): string | null {
    // Check if authentication middleware added user object
    // This is a common pattern used by passport, express-jwt, etc.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const user = (req as { user?: { userId?: unknown } }).user;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (!user || !user.userId) {
      return null;
    }

    if (typeof user.userId !== 'string') {
      return null;
    }

    return user.userId;
  }

  /**
   * Validates request format (NOT business rules)
   *
   * Only checks:
   * - Required fields are present
   * - Fields are of expected type
   * - Basic format checks
   *
   * Does NOT check:
   * - Password complexity (that's domain/application)
   * - Current password is correct (that's domain)
   * - User exists (that's application)
   *
   * @param body - Request body to validate
   * @returns Error message if invalid, null if valid
   */
  private validateRequestFormat(body: Record<string, unknown>): string | null {
    // Check currentMasterPassword field
    if (!body.currentMasterPassword) {
      return 'Current master password is required';
    }

    if (typeof body.currentMasterPassword !== 'string') {
      return 'Current master password must be a string';
    }

    if (body.currentMasterPassword.trim().length === 0) {
      return 'Current master password cannot be empty';
    }

    // Check newMasterPassword field
    if (!body.newMasterPassword) {
      return 'New master password is required';
    }

    if (typeof body.newMasterPassword !== 'string') {
      return 'New master password must be a string';
    }

    if (body.newMasterPassword.trim().length === 0) {
      return 'New master password cannot be empty';
    }

    // Check passwords are different (basic sanity check)
    if (body.currentMasterPassword === body.newMasterPassword) {
      return 'New password must be different from current password';
    }

    // All format validations passed
    return null;
  }

  /**
   * Maps domain exceptions to appropriate HTTP status codes
   *
   * Error mapping strategy:
   * - InvalidCredentialsException → 401 Unauthorized (wrong current password)
   * - UserNotFoundException → 404 Not Found
   * - Password complexity errors → 400 Bad Request
   * - Re-encryption errors → 500 Internal Server Error
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
    console.error('[ChangeMasterPasswordController] Error:', error);

    // Map domain exceptions to HTTP responses
    if (error instanceof InvalidCredentialsException) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Current master password is incorrect',
      });
      return;
    }

    if (error instanceof UserNotFoundException) {
      res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
      return;
    }

    // Check for password complexity validation errors
    if (
      error instanceof Error &&
      (error.message.includes('Password must') ||
        error.message.includes('password') ||
        error.message.includes('complexity'))
    ) {
      res.status(400).json({
        error: 'Bad Request',
        message: error.message,
      });
      return;
    }

    // Check for re-encryption errors
    if (error instanceof Error && error.message.includes('Failed to re-encrypt')) {
      res.status(500).json({
        error: 'Internal Server Error',
        message:
          'Failed to re-encrypt password entries. Please try again or contact support.',
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
