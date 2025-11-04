import { Router } from 'express';
import { CreatePasswordEntryController } from '../controllers/CreatePasswordEntryController';
import { authenticateJWT } from '../../../../../../apps/api/middleware/authenticateJWT';

/**
 * Password Entry Routes
 *
 * This file defines all HTTP routes for the PasswordVault/Passwords context.
 * It follows REST principles and Hexagonal Architecture.
 *
 * Architecture Notes:
 * - Routes are part of the Infrastructure Layer (Primary Adapters)
 * - They wire HTTP endpoints to controllers
 * - Controllers delegate to Application Use Cases
 * - No business logic here - only routing configuration
 *
 * Route Design (RESTful):
 * - POST   /api/passwords          - Create a new password entry
 * - GET    /api/passwords          - Get all password entries for authenticated user (future)
 * - GET    /api/passwords/:id      - Get a specific password entry (future)
 * - PUT    /api/passwords/:id      - Update a password entry (future)
 * - DELETE /api/passwords/:id      - Delete a password entry (future)
 * - GET    /api/passwords/search   - Search password entries (future)
 *
 * Authentication:
 * - ALL routes require authentication
 * - Authentication middleware extracts userId from JWT
 * - Controllers use userId to enforce authorization
 *
 * Base Path:
 * - These routes are mounted at /api/passwords
 * - Example: app.use('/api/passwords', passwordsRouter)
 * - Results in: POST http://localhost:3000/api/passwords
 */

/**
 * Authentication Middleware (Placeholder)
 *
 * This middleware should:
 * 1. Extract JWT token from Authorization header
 * 2. Verify token signature and expiration
 * 3. Extract userId from token payload
 * 4. Add userId to req.user.userId
 * 5. Call next() if valid, or return 401 if invalid
 *
 * Implementation options:
 * 1. Custom middleware using jsonwebtoken library
 * 2. express-jwt library
 * 3. passport-jwt strategy
 *
 * For now, we'll reference it but not implement it here.
 * It should be implemented in a shared location and imported.
 *
 * Example implementation location:
 * - src/Contexts/Shared/infrastructure/http/middleware/authenticateJWT.ts
 * - Or reuse from Authentication context if available
 *
 * Example usage:
 * ```typescript
 * import { authenticateJWT } from '../../../../Shared/infrastructure/http/middleware/authenticateJWT';
 * router.post('/', authenticateJWT, (req, res) => createController.run(req, res));
 * ```
 *
 * For this implementation, we'll add a TODO comment where middleware should be applied.
 */

/**
 * Creates the passwords router with all dependencies injected
 *
 * @param createController - Fully configured CreatePasswordEntryController
 * @returns Express Router with password routes configured
 *
 * Example usage:
 * ```typescript
 * import { createPasswordsRoutes } from './routes/passwords.routes';
 * import { createCreatePasswordEntryController } from './dependencies';
 *
 * const createController = createCreatePasswordEntryController(
 *   passwordEntryRepository,
 *   passwordEncryptionService
 * );
 *
 * const passwordsRouter = createPasswordsRoutes(createController);
 * app.use('/api/passwords', passwordsRouter);
 * ```
 */
export function createPasswordsRoutes(
  createController: CreatePasswordEntryController
): Router {
  const router = Router();

  /**
   * POST /api/passwords
   *
   * Create a new password entry
   *
   * Authentication: REQUIRED (JWT middleware should be applied at app level or here)
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
   * Success Response (201 Created):
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
   * Error Responses:
   * - 400 Bad Request: Validation errors
   *   Examples:
   *   - Missing required fields (siteName, username, password, category)
   *   - Invalid field types
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
   *
   * Security Notes:
   * - Password is sent in plain text (HTTPS required in production)
   * - Password is encrypted before storage
   * - Password is NOT returned in response
   * - User can only create entries for themselves (userId from JWT)
   *
   * Authentication Middleware Applied:
   * - authenticateJWT verifies JWT token from Authorization header
   * - Extracts userId from token payload
   * - Adds userId to req.user.userId
   * - Returns 401 if token is missing, invalid, or expired
   */
  router.post('/', authenticateJWT, (req, res) => {
    void createController.run(req, res);
  });

  /**
   * Future routes to be implemented:
   */

  /**
   * GET /api/passwords
   *
   * Get all password entries for the authenticated user
   *
   * Future implementation will include:
   * - Pagination (page, limit query params)
   * - Sorting (sortBy, order query params)
   * - Filtering (category, tags query params)
   * - Search (q query param)
   *
   * Example:
   * router.get('/', authenticateJWT, (req, res) => getPasswordEntriesController.run(req, res));
   */

  /**
   * GET /api/passwords/:id
   *
   * Get a specific password entry by ID
   *
   * Security:
   * - Must verify entry belongs to authenticated user
   * - Return 404 if not found or unauthorized (don't reveal existence)
   *
   * Response includes decrypted password (use with caution!)
   *
   * Example:
   * router.get('/:id', authenticateJWT, (req, res) => getPasswordEntryController.run(req, res));
   */

  /**
   * PUT /api/passwords/:id
   *
   * Update a password entry
   *
   * Can update:
   * - siteName
   * - siteUrl
   * - username
   * - password (will be re-encrypted)
   * - category
   * - notes
   * - tags
   *
   * Security:
   * - Must verify entry belongs to authenticated user
   *
   * Example:
   * router.put('/:id', authenticateJWT, (req, res) => updatePasswordEntryController.run(req, res));
   */

  /**
   * DELETE /api/passwords/:id
   *
   * Delete a password entry
   *
   * Security:
   * - Must verify entry belongs to authenticated user
   * - Consider soft delete instead of hard delete
   *
   * Example:
   * router.delete('/:id', authenticateJWT, (req, res) => deletePasswordEntryController.run(req, res));
   */

  /**
   * GET /api/passwords/search
   *
   * Search password entries
   *
   * Query parameters:
   * - q: Search query (searches siteName, username, notes)
   * - category: Filter by category
   * - tags: Filter by tags (comma-separated)
   *
   * Example:
   * router.get('/search', authenticateJWT, (req, res) => searchPasswordEntriesController.run(req, res));
   */

  /**
   * POST /api/passwords/:id/decrypt
   *
   * Decrypt a password entry
   *
   * Requires master password for additional security
   *
   * Request body:
   * {
   *   "masterPassword": "user's master password"
   * }
   *
   * Response:
   * {
   *   "password": "decrypted password"
   * }
   *
   * Security:
   * - Verify master password
   * - Rate limit this endpoint (prevent brute force)
   * - Log access for audit trail
   *
   * Example:
   * router.post('/:id/decrypt', authenticateJWT, rateLimiter, (req, res) => decryptPasswordController.run(req, res));
   */

  return router;
}

/**
 * Alternative: Direct route definition
 *
 * If you prefer to define routes at app setup level:
 *
 * ```typescript
 * import express from 'express';
 * import { createCreatePasswordEntryController } from './dependencies';
 * import { authenticateJWT } from './middleware/authenticateJWT';
 *
 * const app = express();
 * const createController = createCreatePasswordEntryController(
 *   passwordEntryRepository,
 *   passwordEncryptionService
 * );
 *
 * app.post('/api/passwords',
 *   authenticateJWT,
 *   (req, res) => createController.run(req, res)
 * );
 * ```
 */

/**
 * Middleware Integration Notes:
 *
 * Authentication Middleware:
 * The authenticateJWT middleware should be implemented in a shared location.
 *
 * Suggested location:
 * src/Contexts/Shared/infrastructure/http/middleware/authenticateJWT.ts
 *
 * Example implementation:
 * ```typescript
 * import { Request, Response, NextFunction } from 'express';
 * import jwt from 'jsonwebtoken';
 *
 * export function authenticateJWT(req: Request, res: Response, next: NextFunction): void {
 *   const authHeader = req.headers.authorization;
 *
 *   if (!authHeader || !authHeader.startsWith('Bearer ')) {
 *     res.status(401).json({ error: 'Unauthorized', message: 'Missing or invalid token' });
 *     return;
 *   }
 *
 *   const token = authHeader.substring(7);
 *
 *   try {
 *     const jwtSecret = process.env.JWT_SECRET as string;
 *     const decoded = jwt.verify(token, jwtSecret) as { userId: string };
 *
 *     // Add userId to request for controllers to use
 *     (req as any).user = { userId: decoded.userId };
 *
 *     next();
 *   } catch (error) {
 *     res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired token' });
 *   }
 * }
 * ```
 *
 * Then import and use:
 * ```typescript
 * import { authenticateJWT } from '../../../../Shared/infrastructure/http/middleware/authenticateJWT';
 * router.post('/', authenticateJWT, (req, res) => createController.run(req, res));
 * ```
 */

/**
 * Rate Limiting Considerations:
 *
 * For sensitive operations (like decrypting passwords), add rate limiting:
 *
 * ```typescript
 * import rateLimit from 'express-rate-limit';
 *
 * const decryptLimiter = rateLimit({
 *   windowMs: 15 * 60 * 1000, // 15 minutes
 *   max: 10, // Limit each IP to 10 requests per windowMs
 *   message: 'Too many decrypt requests, please try again later'
 * });
 *
 * router.post('/:id/decrypt', authenticateJWT, decryptLimiter, (req, res) => {
 *   void decryptController.run(req, res);
 * });
 * ```
 */
