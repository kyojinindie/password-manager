import { Request, Response } from 'express';
import { PasswordEntryCreator } from '../../../application/Create/PasswordEntryCreator';
import { CreatePasswordEntryRequest } from '../../../application/Create/CreatePasswordEntryRequest';

/**
 * Create Password Entry Controller - Primary Adapter
 *
 * HTTP controller that handles password entry creation requests.
 * This is a PRIMARY (driving/input) adapter in Hexagonal Architecture.
 *
 * Architecture Notes:
 * - This adapter translates HTTP requests into application layer calls
 * - It has ZERO business logic - only HTTP/protocol concerns
 * - It delegates ALL business logic to PasswordEntryCreator use case
 * - It maps domain exceptions to appropriate HTTP status codes
 *
 * Responsibilities (Thin Controller):
 * 1. Extract userId from JWT token (authentication middleware)
 * 2. Validate request format (not business rules)
 * 3. Delegate to application service (PasswordEntryCreator)
 * 4. Format response for HTTP
 * 5. Handle errors and map to HTTP status codes
 *
 * What this controller DOES NOT do:
 * - Password encryption (that's in PasswordEncryptionService)
 * - Business validation (that's in Value Objects and domain)
 * - Password entry creation logic (that's in PasswordEntry.create)
 * - Persistence (that's in repository)
 * - Authorization checks beyond extracting userId from token
 *
 * Security:
 * - This endpoint REQUIRES authentication (JWT middleware must be applied)
 * - User ID is extracted from verified JWT token
 * - Each user can only create entries for themselves
 * - Password is sent in PLAIN TEXT over HTTPS (encrypted at application layer)
 * - Password is NEVER logged or exposed in error messages
 *
 * Dependency Injection:
 * - Receives PasswordEntryCreator use case as constructor dependency
 * - This allows easy testing with mocks
 * - This allows swapping implementations without changing controller
 */
export class CreatePasswordEntryController {
  public constructor(private readonly passwordEntryCreator: PasswordEntryCreator) {}

  /**
   * Handles POST /api/passwords requests
   *
   * Request headers:
   * Authorization: Bearer <access-token>
   *
   * Request body:
   * {
   *   "siteName": "GitHub",
   *   "siteUrl": "https://github.com",       // Optional
   *   "username": "john.doe@email.com",
   *   "password": "MySecurePassword123!",    // Plain text - will be encrypted
   *   "category": "WORK",                     // PERSONAL, WORK, SOCIAL, FINANCIAL, OTHER
   *   "notes": "My work GitHub account",     // Optional, max 1000 chars
   *   "tags": ["important", "2fa-enabled"]   // Optional
   * }
   *
   * Success response (201 Created):
   * {
   *   "id": "uuid",
   *   "siteName": "GitHub",
   *   "siteUrl": "https://github.com",
   *   "username": "john.doe@email.com",
   *   "category": "WORK",
   *   "notes": "My work GitHub account",
   *   "tags": ["important", "2fa-enabled"],
   *   "createdAt": "2024-01-15T10:30:00.000Z",
   *   "updatedAt": "2024-01-15T10:30:00.000Z"
   * }
   *
   * Error responses:
   * - 400 Bad Request: Missing required fields, invalid format, validation errors
   *   Examples:
   *   - Missing siteName, username, password, or category
   *   - Site name too long (> 100 chars)
   *   - Invalid URL format
   *   - Username too long (> 100 chars)
   *   - Invalid category value
   *   - Notes too long (> 1000 chars)
   *   - Invalid tag format
   *
   * - 401 Unauthorized: Missing or invalid JWT token
   *
   * - 500 Internal Server Error: Unexpected errors
   *   - Encryption failure
   *   - Database errors
   *
   * Security Notes:
   * - Password is received in PLAIN TEXT (must use HTTPS in production)
   * - Password is encrypted with user's master password before storage
   * - Password is NEVER returned in response (security)
   * - Password is NEVER logged (security)
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
      const { siteName, siteUrl, username, password, category, notes, tags } = req.body;

      const createRequest: CreatePasswordEntryRequest = {
        userId,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        siteName,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        siteUrl,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        username,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        password, // Plain text - will be encrypted by application service
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        category,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        notes,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        tags,
      };

      // Step 4: Delegate to application service (use case)
      // This orchestrates:
      // - Creating Value Objects (with validation)
      // - Encrypting the password
      // - Creating the PasswordEntry aggregate
      // - Persisting via repository
      const createResponse = await this.passwordEntryCreator.run(createRequest);

      // Step 5: Return formatted HTTP response
      // 201 Created is appropriate for resource creation
      // Note: Password is NOT included in response (security)
      res.status(201).json({
        id: createResponse.id,
        siteName: createResponse.siteName,
        siteUrl: createResponse.siteUrl,
        username: createResponse.username,
        category: createResponse.category,
        notes: createResponse.notes,
        tags: createResponse.tags,
        createdAt: createResponse.createdAt.toISOString(),
        updatedAt: createResponse.updatedAt.toISOString(),
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
   * 3. Added it to req.user.userId
   *
   * @param req - Express request object
   * @returns The user's ID, or null if not authenticated
   *
   * Note: The exact location depends on your authentication middleware
   * Common patterns:
   * - req.user.userId (if middleware adds user object) ← We use this
   * - req.userId (if middleware adds directly)
   * - req.auth.userId (if using express-jwt)
   */
  private extractUserIdFromRequest(req: Request): string | null {
    // Check if authentication middleware added user object
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
   * - Site name length (that's SiteName VO)
   * - URL validity (that's SiteUrl VO)
   * - Username length (that's Username VO)
   * - Category validity (that's Category VO)
   * - Notes length (that's Notes VO)
   * - Tag validity (that's Tag VO)
   *
   * @param body - Request body to validate
   * @returns Error message if invalid, null if valid
   */
  private validateRequestFormat(body: Record<string, unknown>): string | null {
    // Check siteName field (required)
    if (!body.siteName) {
      return 'Site name is required';
    }
    if (typeof body.siteName !== 'string') {
      return 'Site name must be a string';
    }
    if (body.siteName.trim().length === 0) {
      return 'Site name cannot be empty';
    }

    // Check siteUrl field (optional)
    if (body.siteUrl !== undefined && body.siteUrl !== null) {
      if (typeof body.siteUrl !== 'string') {
        return 'Site URL must be a string';
      }
    }

    // Check username field (required)
    if (!body.username) {
      return 'Username is required';
    }
    if (typeof body.username !== 'string') {
      return 'Username must be a string';
    }
    if (body.username.trim().length === 0) {
      return 'Username cannot be empty';
    }

    // Check password field (required)
    if (!body.password) {
      return 'Password is required';
    }
    if (typeof body.password !== 'string') {
      return 'Password must be a string';
    }
    if (body.password.trim().length === 0) {
      return 'Password cannot be empty';
    }

    // Check category field (required)
    if (!body.category) {
      return 'Category is required';
    }
    if (typeof body.category !== 'string') {
      return 'Category must be a string';
    }

    // Check notes field (optional)
    if (body.notes !== undefined && body.notes !== null) {
      if (typeof body.notes !== 'string') {
        return 'Notes must be a string';
      }
    }

    // Check tags field (optional)
    if (body.tags !== undefined && body.tags !== null) {
      if (!Array.isArray(body.tags)) {
        return 'Tags must be an array';
      }
      // Check each tag is a string
      for (const tag of body.tags) {
        if (typeof tag !== 'string') {
          return 'Each tag must be a string';
        }
      }
    }

    // All format validations passed
    return null;
  }

  /**
   * Maps domain/application exceptions to appropriate HTTP status codes
   *
   * Error mapping strategy:
   * - Validation errors (InvalidXException from domain) → 400 Bad Request
   * - Unknown errors → 500 Internal Server Error
   *
   * Error patterns to detect (thrown by Value Objects):
   * - "Site name cannot be empty"
   * - "Site name must be between 1 and 100 characters"
   * - "Invalid URL format"
   * - "Username cannot be empty"
   * - "Username must be between 1 and 100 characters"
   * - "Invalid category"
   * - "Notes exceed maximum length of 1000 characters"
   * - "Tag cannot be empty"
   * - "Tag must be between 1 and 50 characters"
   * - "Tags must be unique"
   *
   * Security notes:
   * - Don't expose internal error details to clients
   * - Log full errors server-side for debugging
   * - Return user-friendly messages in responses
   * - NEVER include password in error messages or logs
   *
   * @param error - The error to handle
   * @param res - Express response object
   */
  private handleError(error: unknown, res: Response): void {
    // Log full error for debugging (in production, use proper logger)
    // IMPORTANT: Sanitize error before logging to avoid leaking passwords
    console.error('[CreatePasswordEntryController] Error:', this.sanitizeError(error));

    // Only handle Error instances
    if (!(error instanceof Error)) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred. Please try again later.',
      });
      return;
    }

    const errorMessage = error.message;

    // Map validation errors to 400 Bad Request
    // These are thrown by:
    // - SiteName VO
    // - SiteUrl VO
    // - Username VO
    // - Category VO
    // - Notes VO
    // - Tag VO
    // - Tags VO
    const validationPatterns = [
      'Site name',
      'URL',
      'Username',
      'category',
      'Category',
      'Notes',
      'Tag',
      'Tags',
      'must be between',
      'cannot be empty',
      'exceed maximum length',
      'must be unique',
      'Invalid',
    ];

    const isValidationError = validationPatterns.some(pattern =>
      errorMessage.includes(pattern)
    );

    if (isValidationError) {
      res.status(400).json({
        error: 'Bad Request',
        message: errorMessage,
      });
      return;
    }

    // Map encryption errors to 500 Internal Server Error
    if (errorMessage.includes('encrypt') || errorMessage.includes('Encrypt')) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to encrypt password. Please try again later.',
      });
      return;
    }

    // Unknown error - don't expose details to client
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred. Please try again later.',
    });
  }

  /**
   * Sanitizes error for logging to avoid leaking sensitive data
   *
   * CRITICAL SECURITY FUNCTION:
   * - Removes password from error messages
   * - Removes encrypted password from error messages
   * - Prevents accidental logging of sensitive data
   *
   * @param error - The error to sanitize
   * @returns Sanitized error safe for logging
   */
  private sanitizeError(error: unknown): unknown {
    if (!(error instanceof Error)) {
      return error;
    }

    // Create a copy of the error
    const sanitized = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };

    // Remove any potential password references
    // This is defensive programming - passwords shouldn't be in errors
    // but better safe than sorry
    sanitized.message = sanitized.message.replace(
      /password[^"]*"([^"]*)"/gi,
      'password: [REDACTED]'
    );

    return sanitized;
  }
}

/**
 * Usage Example in Route Configuration:
 *
 * ```typescript
 * import { Router } from 'express';
 * import { CreatePasswordEntryController } from './controllers/CreatePasswordEntryController';
 * import { authenticateJWT } from './middleware/authenticateJWT';
 *
 * const router = Router();
 * const controller = new CreatePasswordEntryController(passwordEntryCreator);
 *
 * router.post('/passwords',
 *   authenticateJWT, // Middleware to verify JWT and add req.user.userId
 *   (req, res) => controller.run(req, res)
 * );
 * ```
 */

/**
 * Testing Considerations:
 *
 * Unit tests should verify:
 * 1. Request format validation works correctly
 * 2. UserId is correctly extracted from req.user
 * 3. DTO is correctly built from request body
 * 4. Application service is called with correct DTO
 * 5. Response is correctly formatted
 * 6. Errors are mapped to correct HTTP status codes
 * 7. Password is never included in response
 * 8. Password is sanitized from logs
 *
 * Integration tests should verify:
 * 1. End-to-end flow from HTTP request to database
 * 2. Authentication middleware integration
 * 3. Error responses for various validation failures
 * 4. Password is correctly encrypted and stored
 *
 * Example unit test:
 * ```typescript
 * it('should return 401 if not authenticated', async () => {
 *   const req = { body: {}, user: undefined } as Request;
 *   const res = mockResponse();
 *
 *   await controller.run(req, res);
 *
 *   expect(res.status).toHaveBeenCalledWith(401);
 * });
 * ```
 */
