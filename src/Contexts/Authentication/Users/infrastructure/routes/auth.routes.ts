import { Router } from 'express';
import { LoginUserController } from '../controllers/LoginUserController';

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
 * - Future routes: /auth/refresh, /auth/logout, etc.
 */

/**
 * Creates the authentication router with all dependencies injected
 *
 * @param loginController - Fully configured LoginUserController with all dependencies
 * @returns Express Router with authentication routes configured
 *
 * Example usage:
 * ```typescript
 * import { createAuthRoutes } from './routes/auth.routes';
 * import { createLoginUserController } from './dependencies';
 *
 * const loginController = createLoginUserController(userRepository);
 * const authRouter = createAuthRoutes(loginController);
 *
 * app.use('/auth', authRouter);
 * ```
 */
export function createAuthRoutes(loginController: LoginUserController): Router {
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
   * Future routes can be added here:
   *
   * router.post('/refresh', (req, res) => refreshTokenController.run(req, res));
   * router.post('/logout', (req, res) => logoutController.run(req, res));
   * router.post('/forgot-password', (req, res) => forgotPasswordController.run(req, res));
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
