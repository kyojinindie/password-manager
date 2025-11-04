import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

/**
 * JWT Authentication Middleware
 *
 * Express middleware that verifies JWT tokens and extracts user identity.
 * This is infrastructure-level code that protects HTTP endpoints.
 *
 * Architecture Notes:
 * - This is NOT part of domain or application layers
 * - It's infrastructure concern (HTTP/authentication protocol)
 * - Controllers receive the authenticated userId and trust it
 * - Business logic doesn't know about JWTs, tokens, or HTTP
 *
 * Responsibilities:
 * 1. Extract JWT token from Authorization header
 * 2. Verify token signature and expiration
 * 3. Extract userId from token payload
 * 4. Add userId to request object (req.user.userId)
 * 5. Allow request to proceed if valid
 * 6. Reject request with 401 if invalid
 *
 * What this middleware DOES NOT do:
 * - Authorization (checking if user has permission to access resource)
 * - Business logic (that's in domain/application layers)
 * - User validation (that's handled during login)
 * - Token generation (that's handled during login)
 *
 * Security Features:
 * - Verifies token signature (prevents tampering)
 * - Checks token expiration (prevents replay attacks)
 * - Validates token format (prevents malformed tokens)
 * - Uses secure JWT secret from environment
 * - Proper error handling (doesn't leak information)
 *
 * Token Format Expected:
 * Authorization: Bearer <jwt-token>
 *
 * Token Payload Expected:
 * {
 *   userId: string,
 *   iat: number,    // Issued at
 *   exp: number     // Expiration
 * }
 *
 * Error Responses:
 * - 401 Unauthorized: Missing token, invalid token, expired token
 *
 * Usage Example:
 * ```typescript
 * import { authenticateJWT } from './middleware/authenticateJWT';
 *
 * // Protect a route
 * router.post('/passwords', authenticateJWT, (req, res) => {
 *   // At this point, req.user.userId is guaranteed to exist
 *   const userId = req.user.userId;
 *   // ... delegate to controller
 * });
 * ```
 */

/**
 * Extended Request type with user property
 *
 * TypeScript needs to know about the custom properties we add to Request.
 * We extend the Express Request type to include our user property.
 *
 * This is a common pattern in Express.js with TypeScript.
 */
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
  };
}

/**
 * JWT Authentication Middleware Function
 *
 * @param req - Express request object (will be extended with user property)
 * @param res - Express response object (used to send error responses)
 * @param next - Express next function (called if authentication succeeds)
 *
 * Flow:
 * 1. Extract token from Authorization header
 * 2. Verify token is valid (signature + expiration)
 * 3. Extract userId from token payload
 * 4. Add userId to req.user.userId
 * 5. Call next() to proceed to route handler
 * 6. OR send 401 error if any step fails
 *
 * Error Cases:
 * - No Authorization header → 401
 * - Authorization header doesn't start with "Bearer " → 401
 * - Token is malformed → 401
 * - Token signature is invalid → 401
 * - Token is expired → 401
 * - Token payload doesn't contain userId → 401
 */
export function authenticateJWT(req: Request, res: Response, next: NextFunction): void {
  try {
    // ========================================================================
    // Step 1: Extract Authorization header
    // ========================================================================

    const authHeader = req.headers.authorization;

    // Check if Authorization header exists
    if (!authHeader) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing authentication token. Please provide a valid access token.',
      });
      return;
    }

    // ========================================================================
    // Step 2: Extract token from "Bearer <token>" format
    // ========================================================================

    // Authorization header format: "Bearer <token>"
    // We need to extract the token part
    if (!authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid authentication format. Expected "Bearer <token>".',
      });
      return;
    }

    // Extract token (everything after "Bearer ")
    const token = authHeader.substring(7); // "Bearer " is 7 characters

    // Check if token exists after "Bearer "
    if (!token || token.trim().length === 0) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing authentication token.',
      });
      return;
    }

    // ========================================================================
    // Step 3: Verify token signature and expiration
    // ========================================================================

    // Get JWT secret from environment
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      // This is a configuration error, not a client error
      console.error('[authenticateJWT] CRITICAL: JWT_SECRET is not configured');
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Authentication service is misconfigured.',
      });
      return;
    }

    // Verify token
    // This will throw if:
    // - Token signature is invalid (token was tampered with)
    // - Token is expired (exp claim is in the past)
    // - Token is malformed (not valid JWT format)
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

    // ========================================================================
    // Step 4: Extract userId from token payload
    // ========================================================================

    // Token payload should contain userId
    // This was set during login when token was created
    const userId = decoded.userId as string | undefined;

    if (!userId || typeof userId !== 'string') {
      // Token is valid but doesn't contain userId
      // This shouldn't happen if token generation is correct
      console.error('[authenticateJWT] Token is valid but missing userId claim');
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token payload.',
      });
      return;
    }

    // ========================================================================
    // Step 5: Add userId to request object for controllers to use
    // ========================================================================

    // Cast request to our extended type
    const authenticatedReq = req as AuthenticatedRequest;

    // Add user object with userId
    authenticatedReq.user = {
      userId,
    };

    // ========================================================================
    // Step 6: Proceed to next middleware/route handler
    // ========================================================================

    // Authentication successful - allow request to proceed
    next();
  } catch (error) {
    // ========================================================================
    // Error Handling
    // ========================================================================

    // jwt.verify() throws errors for various reasons
    // We catch them all and return 401 Unauthorized

    // Log error for debugging (use proper logger in production)
    console.error('[authenticateJWT] Authentication failed:', error);

    // Determine error message based on error type
    let message = 'Invalid or expired authentication token.';

    if (error instanceof jwt.TokenExpiredError) {
      message = 'Authentication token has expired. Please login again.';
    } else if (error instanceof jwt.JsonWebTokenError) {
      message = 'Invalid authentication token.';
    } else if (error instanceof jwt.NotBeforeError) {
      message = 'Authentication token is not yet valid.';
    }

    // Return 401 Unauthorized
    // Don't expose internal error details to client (security)
    res.status(401).json({
      error: 'Unauthorized',
      message,
    });
  }
}

/**
 * Type Guard: Check if request has been authenticated
 *
 * Use this in controllers to verify authentication (TypeScript type safety).
 *
 * Example:
 * ```typescript
 * if (isAuthenticatedRequest(req)) {
 *   const userId = req.user.userId; // TypeScript knows this exists
 * }
 * ```
 *
 * @param req - Express request object
 * @returns true if request has user property with userId
 */
export function isAuthenticatedRequest(req: Request): req is AuthenticatedRequest {
  return (
    'user' in req &&
    typeof (req as AuthenticatedRequest).user === 'object' &&
    (req as AuthenticatedRequest).user !== null &&
    'userId' in ((req as AuthenticatedRequest).user ?? {}) &&
    typeof (req as AuthenticatedRequest).user?.userId === 'string'
  );
}

/**
 * Optional: Middleware to check if token is blacklisted
 *
 * This is an additional layer of security for logout functionality.
 * If you implement a token blacklist (for logout), add this middleware.
 *
 * Example:
 * ```typescript
 * router.post('/passwords',
 *   authenticateJWT,
 *   checkTokenNotBlacklisted, // Add this
 *   (req, res) => controller.run(req, res)
 * );
 * ```
 */
export function checkTokenNotBlacklisted(
  _req: Request,
  _res: Response,
  next: NextFunction
): void {
  // TODO: Implement token blacklist check
  // 1. Extract token from Authorization header
  // 2. Check if token is in blacklist (Redis, in-memory, database)
  // 3. If blacklisted → return 401 "Token has been revoked"
  // 4. If not blacklisted → call next()

  // For now, just proceed (no blacklist implemented)
  next();
}

/**
 * Testing Notes:
 *
 * Unit tests should verify:
 * 1. Accepts valid JWT token with correct signature
 * 2. Extracts userId from token payload correctly
 * 3. Adds userId to req.user.userId
 * 4. Calls next() on success
 * 5. Returns 401 if Authorization header is missing
 * 6. Returns 401 if Authorization header doesn't start with "Bearer "
 * 7. Returns 401 if token is empty after "Bearer "
 * 8. Returns 401 if token signature is invalid
 * 9. Returns 401 if token is expired
 * 10. Returns 401 if token payload doesn't contain userId
 * 11. Returns 500 if JWT_SECRET is not configured
 *
 * Example unit test:
 * ```typescript
 * import { authenticateJWT } from './authenticateJWT';
 * import jwt from 'jsonwebtoken';
 *
 * describe('authenticateJWT', () => {
 *   it('should authenticate valid token', () => {
 *     const token = jwt.sign({ userId: 'user-123' }, 'secret', { expiresIn: '15m' });
 *     const req = {
 *       headers: { authorization: `Bearer ${token}` }
 *     } as Request;
 *     const res = mockResponse();
 *     const next = jest.fn();
 *
 *     process.env.JWT_SECRET = 'secret';
 *     authenticateJWT(req, res, next);
 *
 *     expect(next).toHaveBeenCalled();
 *     expect((req as any).user.userId).toBe('user-123');
 *   });
 *
 *   it('should return 401 if token is missing', () => {
 *     const req = { headers: {} } as Request;
 *     const res = mockResponse();
 *     const next = jest.fn();
 *
 *     authenticateJWT(req, res, next);
 *
 *     expect(res.status).toHaveBeenCalledWith(401);
 *     expect(next).not.toHaveBeenCalled();
 *   });
 * });
 * ```
 */

/**
 * Security Considerations:
 *
 * 1. JWT Secret:
 *    - Must be kept secret (use environment variable)
 *    - Should be long and cryptographically random (>= 32 characters)
 *    - Never commit to version control
 *    - Rotate periodically in production
 *
 * 2. Token Expiration:
 *    - Access tokens should have short expiration (15 minutes recommended)
 *    - Use refresh tokens for longer sessions
 *    - Implement token refresh endpoint
 *
 * 3. Token Storage (Client-side):
 *    - Store in memory (most secure, lost on page refresh)
 *    - Or HttpOnly cookies (secure, survives refresh)
 *    - Never localStorage (vulnerable to XSS)
 *
 * 4. HTTPS:
 *    - Always use HTTPS in production
 *    - Tokens in Authorization header travel with every request
 *    - HTTP allows token interception (man-in-the-middle)
 *
 * 5. Token Blacklist:
 *    - Implement for logout functionality
 *    - Store revoked tokens (Redis recommended)
 *    - Clean up expired tokens periodically
 *
 * 6. Rate Limiting:
 *    - Add rate limiting to prevent brute force
 *    - Limit failed authentication attempts
 *    - Use express-rate-limit or similar
 *
 * 7. Error Messages:
 *    - Don't leak information in error messages
 *    - Don't distinguish between "user not found" and "wrong password"
 *    - Generic "invalid credentials" is safer
 */

/**
 * Production Enhancements:
 *
 * 1. Proper Logging:
 * ```typescript
 * import { logger } from './logger';
 * logger.error('[authenticateJWT] Authentication failed', { error, userId });
 * ```
 *
 * 2. Metrics/Monitoring:
 * ```typescript
 * import { metrics } from './metrics';
 * metrics.increment('auth.failed');
 * ```
 *
 * 3. Token Refresh:
 * ```typescript
 * // Check if token expires soon
 * if (decoded.exp && decoded.exp - Date.now() / 1000 < 300) {
 *   // Token expires in < 5 minutes
 *   // Add header to suggest client to refresh
 *   res.setHeader('X-Token-Refresh-Suggested', 'true');
 * }
 * ```
 *
 * 4. Audit Trail:
 * ```typescript
 * auditLog.record({
 *   action: 'authenticate',
 *   userId: decoded.userId,
 *   ip: req.ip,
 *   userAgent: req.headers['user-agent'],
 *   timestamp: new Date(),
 * });
 * ```
 */
