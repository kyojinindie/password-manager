import { Request, Response } from 'express';
import { PasswordEntriesLister } from '../../../application/List/PasswordEntriesLister';
import { ListPasswordEntriesRequest } from '../../../application/List/ListPasswordEntriesRequest';

/**
 * List Password Entries Controller - Primary Adapter
 *
 * HTTP controller that handles password entry listing requests with pagination,
 * sorting, and filtering capabilities.
 * This is a PRIMARY (driving/input) adapter in Hexagonal Architecture.
 *
 * Architecture Notes:
 * - This adapter translates HTTP requests into application layer calls
 * - It has ZERO business logic - only HTTP/protocol concerns
 * - It delegates ALL business logic to PasswordEntriesLister use case
 * - It maps errors to appropriate HTTP status codes
 *
 * Responsibilities (Thin Controller):
 * 1. Extract userId from JWT token (authentication middleware)
 * 2. Extract and validate query parameters (page, limit, sortBy, sortOrder, category)
 * 3. Build ListPasswordEntriesRequest DTO
 * 4. Delegate to application service (PasswordEntriesLister)
 * 5. Format response for HTTP with data and pagination metadata
 * 6. Handle errors and map to HTTP status codes
 *
 * What this controller DOES NOT do:
 * - Business logic (that's in domain/application layers)
 * - Data access (that's in repository)
 * - Password decryption (that's intentional - passwords stay encrypted in list view)
 * - Authorization beyond extracting userId from token
 *
 * Security:
 * - This endpoint REQUIRES authentication (JWT middleware must be applied)
 * - User ID is extracted from verified JWT token
 * - Each user can only see their own entries (enforced by repository)
 * - Passwords are returned ENCRYPTED (not plain text)
 * - No sensitive data in query parameters
 *
 * Dependency Injection:
 * - Receives PasswordEntriesLister use case as constructor dependency
 * - This allows easy testing with mocks
 * - This allows swapping implementations without changing controller
 */
export class ListPasswordEntriesController {
  public constructor(private readonly passwordEntriesLister: PasswordEntriesLister) {}

  /**
   * Handles GET /api/passwords requests
   *
   * Request headers:
   * Authorization: Bearer <access-token>
   *
   * Query parameters (all optional):
   * - page: Page number (1-based, default: 1)
   * - limit: Items per page (default: 20, max: 100)
   * - sortBy: Field to sort by (siteName, createdAt, category, default: siteName)
   * - sortOrder: Sort direction (asc, desc, default: asc)
   * - category: Category filter (PERSONAL, WORK, SOCIAL, FINANCIAL, OTHER)
   *
   * Example requests:
   * - GET /api/passwords
   * - GET /api/passwords?page=2&limit=10
   * - GET /api/passwords?sortBy=createdAt&sortOrder=desc
   * - GET /api/passwords?category=WORK
   * - GET /api/passwords?page=1&limit=20&sortBy=siteName&sortOrder=asc&category=PERSONAL
   *
   * Success response (200 OK):
   * {
   *   "data": [
   *     {
   *       "id": "uuid",
   *       "userId": "user-id",
   *       "siteName": "GitHub",
   *       "siteUrl": "https://github.com",
   *       "username": "john.doe@email.com",
   *       "encryptedPassword": "encrypted-password-string",  // Note: ENCRYPTED
   *       "category": "WORK",
   *       "notes": "My work GitHub account",
   *       "tags": ["important", "2fa-enabled"],
   *       "createdAt": "2024-01-15T10:30:00.000Z",
   *       "updatedAt": "2024-01-15T10:30:00.000Z"
   *     },
   *     // ... more entries
   *   ],
   *   "pagination": {
   *     "page": 1,
   *     "limit": 20,
   *     "total": 45,
   *     "totalPages": 3
   *   }
   * }
   *
   * Error responses:
   * - 400 Bad Request: Invalid query parameters
   *   Examples:
   *   - page is not a positive integer
   *   - limit is not a positive integer or exceeds 100
   *   - sortBy is not one of the allowed values
   *   - sortOrder is not 'asc' or 'desc'
   *
   * - 401 Unauthorized: Missing or invalid JWT token
   *
   * - 500 Internal Server Error: Unexpected errors
   *
   * Security Notes:
   * - Passwords are returned ENCRYPTED (not plain text)
   * - User can only see their own entries (userId from JWT)
   * - No sensitive data in query parameters (safe to log)
   */
  public async run(req: Request, res: Response): Promise<void> {
    try {
      // Step 1: Extract userId from authenticated request
      const userId = this.extractUserIdFromRequest(req);
      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required. Please provide a valid access token.',
        });
        return;
      }

      // Step 2: Extract and validate query parameters
      const queryParams = this.extractQueryParams(req);
      const validationError = this.validateQueryParams(queryParams);
      if (validationError) {
        res.status(400).json({
          error: 'Bad Request',
          message: validationError,
        });
        return;
      }

      // Step 3: Build application DTO from HTTP request
      const listRequest: ListPasswordEntriesRequest = {
        userId,
        page: queryParams.page,
        limit: queryParams.limit,
        sortBy: queryParams.sortBy,
        sortOrder: queryParams.sortOrder,
        category: queryParams.category,
      };

      // Step 4: Delegate to application service (use case)
      // This orchestrates:
      // - Retrieving password entries from repository with criteria
      // - Calculating pagination metadata
      // - Mapping domain aggregates to DTOs
      const listResponse = await this.passwordEntriesLister.run(listRequest);

      // Step 5: Return formatted HTTP response
      // 200 OK is appropriate for successful retrieval
      res.status(200).json({
        data: listResponse.data,
        pagination: listResponse.pagination,
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
   * Extracts query parameters from the request
   *
   * Handles type conversion from query strings to appropriate types:
   * - page: string → number
   * - limit: string → number
   * - sortBy: string (validated later)
   * - sortOrder: string (validated later)
   * - category: string (optional)
   *
   * @param req - Express request object
   * @returns Extracted query parameters with appropriate types
   */
  private extractQueryParams(req: Request): {
    page?: number;
    limit?: number;
    sortBy?: 'siteName' | 'createdAt' | 'category';
    sortOrder?: 'asc' | 'desc';
    category?: string;
  } {
    const { page, limit, sortBy, sortOrder, category } = req.query;

    // Validate and cast sortBy
    const validSortBy = ['siteName', 'createdAt', 'category'];
    const parsedSortBy =
      typeof sortBy === 'string' && validSortBy.includes(sortBy)
        ? (sortBy as 'siteName' | 'createdAt' | 'category')
        : undefined;

    // Validate and cast sortOrder
    const parsedSortOrder =
      sortOrder === 'asc' || sortOrder === 'desc' ? sortOrder : undefined;

    return {
      page: page ? this.parsePositiveInteger(page as string) : undefined,
      limit: limit ? this.parsePositiveInteger(limit as string) : undefined,
      sortBy: parsedSortBy,
      sortOrder: parsedSortOrder,
      category: category as string | undefined,
    };
  }

  /**
   * Parses a string to a positive integer
   *
   * @param value - String value to parse
   * @returns Parsed integer, or undefined if invalid
   */
  private parsePositiveInteger(value: string): number | undefined {
    const parsed = parseInt(value, 10);
    return !isNaN(parsed) && parsed > 0 ? parsed : undefined;
  }

  /**
   * Validates query parameters
   *
   * Checks:
   * - page is a positive integer (if provided)
   * - limit is a positive integer and does not exceed max (if provided)
   * - sortBy is one of the allowed values (if provided)
   * - sortOrder is 'asc' or 'desc' (if provided)
   * - category is not validated here (repository will handle invalid categories)
   *
   * @param params - Query parameters to validate
   * @returns Error message if invalid, null if valid
   */
  private validateQueryParams(params: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
    category?: string;
  }): string | null {
    // Validate page
    if (params.page !== undefined) {
      if (!Number.isInteger(params.page) || params.page < 1) {
        return 'Page must be a positive integer';
      }
    }

    // Validate limit
    const MAX_LIMIT = 100;
    if (params.limit !== undefined) {
      if (!Number.isInteger(params.limit) || params.limit < 1) {
        return 'Limit must be a positive integer';
      }
      if (params.limit > MAX_LIMIT) {
        return `Limit cannot exceed ${MAX_LIMIT}`;
      }
    }

    // Validate sortBy
    const allowedSortByValues = ['siteName', 'createdAt', 'category'];
    if (params.sortBy !== undefined) {
      if (!allowedSortByValues.includes(params.sortBy)) {
        return `sortBy must be one of: ${allowedSortByValues.join(', ')}`;
      }
    }

    // Validate sortOrder
    if (params.sortOrder !== undefined) {
      if (params.sortOrder !== 'asc' && params.sortOrder !== 'desc') {
        return "sortOrder must be 'asc' or 'desc'";
      }
    }

    // All validations passed
    return null;
  }

  /**
   * Maps errors to appropriate HTTP status codes
   *
   * Error mapping strategy:
   * - Validation errors from domain/application → 400 Bad Request
   * - Unknown errors → 500 Internal Server Error
   *
   * Security notes:
   * - Don't expose internal error details to clients
   * - Log full errors server-side for debugging
   * - Return user-friendly messages in responses
   *
   * @param error - The error to handle
   * @param res - Express response object
   */
  private handleError(error: unknown, res: Response): void {
    // Log full error for debugging (in production, use proper logger)
    console.error('[ListPasswordEntriesController] Error:', error);

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
    // These could be thrown by domain layer (though unlikely in list operation)
    const validationPatterns = ['Invalid', 'must be', 'cannot be', 'required'];

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

    // Unknown error - don't expose details to client
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred. Please try again later.',
    });
  }
}

/**
 * Usage Example in Route Configuration:
 *
 * ```typescript
 * import { Router } from 'express';
 * import { ListPasswordEntriesController } from './controllers/ListPasswordEntriesController';
 * import { authenticateJWT } from './middleware/authenticateJWT';
 *
 * const router = Router();
 * const controller = new ListPasswordEntriesController(passwordEntriesLister);
 *
 * router.get('/passwords',
 *   authenticateJWT, // Middleware to verify JWT and add req.user.userId
 *   (req, res) => controller.run(req, res)
 * );
 * ```
 */

/**
 * Testing Considerations:
 *
 * Unit tests should verify:
 * 1. Query parameter extraction works correctly
 * 2. Query parameter validation works for all edge cases
 * 3. UserId is correctly extracted from req.user
 * 4. DTO is correctly built from query parameters
 * 5. Application service is called with correct DTO
 * 6. Response is correctly formatted with data and pagination
 * 7. Errors are mapped to correct HTTP status codes
 * 8. Default values are applied when parameters are missing
 *
 * Integration tests should verify:
 * 1. End-to-end flow from HTTP request to database
 * 2. Authentication middleware integration
 * 3. Pagination works correctly
 * 4. Sorting works correctly (all fields and both directions)
 * 5. Filtering by category works correctly
 * 6. Empty result sets are handled properly
 * 7. Edge cases (page beyond total pages, etc.)
 *
 * Example unit test:
 * ```typescript
 * it('should return 400 if page is not a positive integer', async () => {
 *   const req = {
 *     query: { page: '-1' },
 *     user: { userId: 'user-123' }
 *   } as unknown as Request;
 *   const res = mockResponse();
 *
 *   await controller.run(req, res);
 *
 *   expect(res.status).toHaveBeenCalledWith(400);
 *   expect(res.json).toHaveBeenCalledWith({
 *     error: 'Bad Request',
 *     message: 'Page must be a positive integer'
 *   });
 * });
 * ```
 */
