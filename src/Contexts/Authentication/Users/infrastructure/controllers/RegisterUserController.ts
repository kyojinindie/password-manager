import { Request, Response } from 'express';
import { UserRegister } from '../../application/Register/UserRegister';
import { RegisterUserRequest } from '../../application/Register/RegisterUserRequest';

/**
 * Register User Controller - Primary Adapter
 *
 * HTTP controller that handles user registration requests.
 * This is a PRIMARY (driving/input) adapter in Hexagonal Architecture.
 *
 * Architecture Notes:
 * - This adapter translates HTTP requests into application layer calls
 * - It has ZERO business logic - only HTTP/protocol concerns
 * - It delegates ALL business logic to the UserRegister use case
 * - It maps domain exceptions to appropriate HTTP status codes
 *
 * Responsibilities (Thin Controller):
 * 1. Extract and validate request format (not business rules)
 * 2. Delegate to application service (UserRegister)
 * 3. Format response for HTTP
 * 4. Handle errors and map to HTTP status codes
 *
 * What this controller DOES NOT do:
 * - Business validation (that's in domain/application)
 * - Email format validation (basic check here, full validation in Email VO)
 * - Password complexity validation (that's in MasterPasswordHashingService)
 * - Username validation (that's in Username VO)
 * - Uniqueness checks (that's in UserRegister use case)
 * - Password hashing (that's in infrastructure service)
 * - User persistence (that's in repository)
 *
 * Dependency Injection:
 * - Receives UserRegister use case as constructor dependency
 * - This allows easy testing with mocks
 * - This allows swapping implementations without changing controller
 */
export class RegisterUserController {
  public constructor(private readonly userRegister: UserRegister) {}

  /**
   * Handles POST /auth/register requests
   *
   * Request body:
   * {
   *   "email": "user@example.com",
   *   "username": "johndoe",
   *   "masterPassword": "SecurePass123!@#"
   * }
   *
   * Success response (201 Created):
   * {
   *   "userId": "uuid",
   *   "message": "User registered successfully"
   * }
   *
   * Error responses:
   * - 400 Bad Request: Missing fields, invalid format, weak password
   *   Examples:
   *   - Missing required field
   *   - Email without @ symbol
   *   - Password too short (< 12 chars)
   *   - Password missing uppercase/lowercase/number/special char
   *   - Username too short (< 3 chars) or too long (> 50 chars)
   *
   * - 409 Conflict: Resource already exists
   *   Examples:
   *   - Email already registered
   *   - Username already taken
   *
   * - 500 Internal Server Error: Unexpected errors
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
      const { email, username, masterPassword } = req.body;
      const registerRequest: RegisterUserRequest = {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        email,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        username,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        masterPassword,
      };

      // Step 3: Delegate to application service (use case)
      // This will:
      // - Validate password complexity
      // - Create Email and Username value objects (with validation)
      // - Check email and username uniqueness
      // - Hash password with salt
      // - Create and persist User entity
      const userId = await this.userRegister.run(registerRequest);

      // Step 4: Return formatted HTTP response
      // 201 Created is appropriate for resource creation
      res.status(201).json({
        userId,
        message: 'User registered successfully',
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
   * - Email is valid format (full validation in Email VO)
   * - Email exists in database (that's application/domain)
   * - Password complexity rules (that's MasterPasswordHashingService)
   * - Username length/format (that's Username VO)
   * - Username uniqueness (that's application layer)
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

    // Check username field
    if (!body.username) {
      return 'Username is required';
    }

    if (typeof body.username !== 'string') {
      return 'Username must be a string';
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
   * Maps domain/application exceptions to appropriate HTTP status codes
   *
   * Error mapping strategy:
   * - Validation errors (Email, Username, Password) → 400 Bad Request
   * - Uniqueness violations (email/username exists) → 409 Conflict
   * - Unknown errors → 500 Internal Server Error
   *
   * Error Detection Strategy:
   * Since the application layer throws generic Error objects, we analyze
   * error messages to determine the appropriate HTTP status code:
   *
   * 400 Bad Request - Validation failures:
   * - "Invalid email format"
   * - "Email cannot be empty"
   * - "Username cannot be empty"
   * - "Username must be between X and Y characters"
   * - "Master Password must be at least 12 characters long"
   * - "Master Password must contain at least one uppercase letter"
   * - "Master Password must contain at least one lowercase letter"
   * - "Master Password must contain at least one number"
   * - "Master Password must contain at least one special character"
   *
   * 409 Conflict - Resource already exists:
   * - "User with this email already exists"
   * - "User with this username already exists"
   *
   * Security note:
   * - Don't expose internal error details to clients
   * - Log full errors server-side for debugging
   * - Return user-friendly messages in responses
   * - For uniqueness violations, we return the exact message to help users
   *   understand what went wrong (this is not a security concern)
   *
   * @param error - The error to handle
   * @param res - Express response object
   */
  private handleError(error: unknown, res: Response): void {
    // Log full error for debugging (in production, use proper logger)
    console.error('[RegisterUserController] Error:', error);

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
    // - Email VO constructor
    // - Username VO constructor
    // - MasterPasswordHashingService.validatePasswordComplexity()
    const validationErrors = [
      'Invalid email format',
      'Email cannot be empty',
      'Username cannot be empty',
      'Username must be between',
      'Master Password must be at least',
      'Master Password must contain at least one uppercase letter',
      'Master Password must contain at least one lowercase letter',
      'Master Password must contain at least one number',
      'Master Password must contain at least one special character',
    ];

    const isValidationError = validationErrors.some((errorPattern) =>
      errorMessage.includes(errorPattern)
    );

    if (isValidationError) {
      res.status(400).json({
        error: 'Bad Request',
        message: errorMessage,
      });
      return;
    }

    // Map uniqueness violations to 409 Conflict
    // These are thrown by:
    // - UserRegister.ensureEmailIsUnique()
    // - UserRegister.ensureUsernameIsUnique()
    const uniquenessErrors = [
      'User with this email already exists',
      'User with this username already exists',
    ];

    const isUniquenessError = uniquenessErrors.some((errorPattern) =>
      errorMessage.includes(errorPattern)
    );

    if (isUniquenessError) {
      res.status(409).json({
        error: 'Conflict',
        message: errorMessage,
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
