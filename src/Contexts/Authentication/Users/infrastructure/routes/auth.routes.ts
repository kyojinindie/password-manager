import { Router } from 'express';
import { LoginUserController } from '../controllers/LoginUserController';
import { LogoutUserController } from '../controllers/LogoutUserController';
import { RefreshSessionController } from '../controllers/RefreshSessionController';
import { ChangeMasterPasswordController } from '../controllers/ChangeMasterPasswordController';

/**
 * Authentication Routes
 *
 * This file defines all HTTP routes for the Authentication context.
 * It follows REST principles and Hexagonal Architecture.
 *
 * Architecture Notes:
 * - Routes are part of the Infrastructure Layer (Primary Adapters)
 * - They wire HTTP endpoints to controllers
 * - Controllers delegate to Application Use Cases
 * - No business logic here - only routing configuration
 *
 * Route Design:
 * - POST /auth/login - Login user with email and password
 * - POST /auth/logout - Logout user and invalidate tokens
 * - POST /auth/refresh - Refresh session with refresh token
 * - Future routes: /auth/forgot-password, /auth/verify-email, etc.
 */

/**
 * Creates the authentication router with all dependencies injected
 *
 * @param loginController - Fully configured LoginUserController with all dependencies
 * @param logoutController - Fully configured LogoutUserController with all dependencies
 * @param refreshController - Fully configured RefreshSessionController with all dependencies
 * @param changePasswordController - Fully configured ChangeMasterPasswordController with all dependencies
 * @returns Express Router with authentication routes configured
 *
 * Example usage:
 * ```typescript
 * import { createAuthRoutes } from './routes/auth.routes';
 * import {
 *   createLoginUserController,
 *   createLogoutUserController,
 *   createRefreshSessionController,
 *   createChangeMasterPasswordController
 * } from './dependencies';
 *
 * const loginController = createLoginUserController(userRepository);
 * const logoutController = createLogoutUserController();
 * const refreshController = createRefreshSessionController();
 * const changePasswordController = createChangeMasterPasswordController(userRepository, passwordEntryRepository);
 * const authRouter = createAuthRoutes(loginController, logoutController, refreshController, changePasswordController);
 *
 * app.use('/auth', authRouter);
 * ```
 */
export function createAuthRoutes(
  loginController: LoginUserController,
  logoutController: LogoutUserController,
  refreshController: RefreshSessionController,
  changePasswordController: ChangeMasterPasswordController
): Router {
  const router = Router();

  /**
   * POST /auth/login
   *
   * Login a user with email and master password
   *
   * Request body:
   * {
   *   "email": "user@example.com",
   *   "masterPassword": "SecurePassword123!"
   * }
   *
   * Success Response (200):
   * {
   *   "userId": "uuid",
   *   "accessToken": "jwt-token",
   *   "refreshToken": "jwt-refresh-token",
   *   "expiresIn": 900
   * }
   *
   * Error Responses:
   * - 400 Bad Request: Missing or invalid fields
   * - 401 Unauthorized: Invalid credentials
   * - 403 Forbidden: Inactive user account
   * - 423 Locked: Account locked due to failed attempts
   * - 500 Internal Server Error: Unexpected error
   */
  router.post('/login', (req, res) => {
    void loginController.run(req, res);
  });

  /**
   * POST /auth/logout
   *
   * Logout a user by blacklisting their tokens
   *
   * Request headers:
   * Authorization: Bearer <access-token>
   *
   * Request body (optional):
   * {
   *   "refreshToken": "jwt-refresh-token"  // Optional
   * }
   *
   * Success Response (204 No Content):
   * - No body returned
   * - Status 204 indicates successful logout
   *
   * Error Responses:
   * - 400 Bad Request: Invalid token format
   * - 401 Unauthorized: Missing or invalid Authorization header
   * - 500 Internal Server Error: Unexpected error
   *
   * Authentication:
   * - This endpoint REQUIRES authentication
   * - Add authentication middleware before this route in production
   *
   * Notes:
   * - Blacklists the provided access token
   * - Optionally blacklists refresh token if provided
   * - Idempotent: calling multiple times has same effect
   * - No validation needed - invalid tokens are still blacklisted
   */
  router.post('/logout', (req, res) => {
    void logoutController.run(req, res);
  });

  /**
   * POST /auth/refresh
   *
   * Refresh user session with a valid refresh token
   *
   * Request body:
   * {
   *   "refreshToken": "jwt-refresh-token"
   * }
   *
   * Success Response (200):
   * {
   *   "accessToken": "new-jwt-access-token",
   *   "expiresIn": 900
   * }
   *
   * Error Responses:
   * - 400 Bad Request: Missing or invalid refreshToken field
   * - 401 Unauthorized: Invalid, expired, or revoked refresh token
   * - 500 Internal Server Error: Unexpected error
   *
   * Notes:
   * - No authentication middleware required (uses refresh token from body)
   * - Verifies refresh token is not blacklisted
   * - Generates new access token without requiring re-authentication
   * - Does NOT generate a new refresh token (only access token)
   * - Refresh token remains valid until expiration or logout
   */
  router.post('/refresh', (req, res) => {
    void refreshController.run(req, res);
  });

  /**
   * PUT /auth/password
   *
   * Change user's master password
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
   * Success Response (200):
   * {
   *   "userId": "uuid",
   *   "passwordEntriesReEncrypted": 42,
   *   "changedAt": "2024-01-15T10:30:00.000Z"
   * }
   *
   * Error Responses:
   * - 400 Bad Request: Missing or invalid fields
   * - 401 Unauthorized: Wrong current password or missing authentication
   * - 404 Not Found: User not found
   * - 500 Internal Server Error: Re-encryption failure
   *
   * Security Notes:
   * - REQUIRES authentication (JWT middleware)
   * - User can only change their own password
   * - Current password must be verified
   * - All password entries are re-encrypted atomically
   * - This operation may take time for users with many entries
   *
   * Implementation Note:
   * - Authentication middleware must extract userId from JWT token
   * - Middleware should add userId to req.user.userId
   * - Controller expects req.user to be populated by middleware
   */
  router.put('/password', (req, res) => {
    void changePasswordController.run(req, res);
  });

  /**
   * Future routes can be added here:
   *
   * router.post('/forgot-password', (req, res) => forgotPasswordController.run(req, res));
   * router.post('/verify-email', (req, res) => verifyEmailController.run(req, res));
   */

  return router;
}

/**
 * Alternative approach: Direct route definition
 * Use this if you prefer to configure routes at app setup level
 *
 * Example:
 * ```typescript
 * import express from 'express';
 * import { createLoginUserController } from './dependencies';
 *
 * const app = express();
 * const loginController = createLoginUserController(userRepository);
 *
 * app.post('/auth/login', (req, res) => loginController.run(req, res));
 * ```
 */
