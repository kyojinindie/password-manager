/**
 * Dependency Injection Setup for Authentication/Users Context
 *
 * This file demonstrates how to wire dependencies for the Login feature
 * following Hexagonal Architecture and Dependency Injection principles.
 *
 * Architecture Layers (dependency direction):
 * Infrastructure → Application → Domain
 *
 * Key principles:
 * 1. Infrastructure depends on Application and Domain
 * 2. Application depends on Domain
 * 3. Domain depends on NOTHING
 * 4. All dependencies flow INWARD toward the domain
 *
 * Dependency Injection Benefits:
 * - Testability: Easy to replace with mocks/stubs in tests
 * - Flexibility: Swap implementations without changing code
 * - Decoupling: Layers don't know about concrete implementations
 * - Single Responsibility: Each class has one reason to change
 */

import { UserLogin } from '../application/Login/UserLogin';
import { UserLogout } from '../application/Logout/UserLogout';
import { SessionRefresher } from '../application/RefreshSession/SessionRefresher';
import { LoginUserController } from './controllers/LoginUserController';
import { LogoutUserController } from './controllers/LogoutUserController';
import { RefreshSessionController } from './controllers/RefreshSessionController';
import { JwtTokenGenerationService } from './JwtTokenGenerationService';
import { InMemoryTokenBlacklistService } from './InMemoryTokenBlacklistService';
import { MasterPasswordHashingService } from '../domain/MasterPasswordHashingService';
import { UserRepository } from '../domain/UserRepository';
import { TokenBlacklistService } from '../domain/TokenBlacklistService';

/**
 * Creates and wires all dependencies for the Login feature
 *
 * Dependency Graph:
 * ```
 * LoginUserController
 *   └─> UserLogin (use case)
 *       ├─> UserRepository (port - needs implementation)
 *       ├─> MasterPasswordHashingService
 *       └─> TokenGenerationService (port)
 *           └─> JwtTokenGenerationService (implementation)
 * ```
 *
 * @param userRepository - Concrete repository implementation (e.g., TypeOrmUserRepository, MongoUserRepository)
 * @returns Configured LoginUserController ready to handle HTTP requests
 */
export function createLoginUserController(
  userRepository: UserRepository
): LoginUserController {
  // Step 1: Create infrastructure services (Secondary Adapters)
  const jwtSecret = getJwtSecretFromEnvironment();
  const tokenService = new JwtTokenGenerationService(jwtSecret);

  // Step 2: Create domain services
  const hashingService = new MasterPasswordHashingService();

  // Step 3: Create application service (Use Case) with all dependencies
  const userLogin = new UserLogin(userRepository, hashingService, tokenService);

  // Step 4: Create controller (Primary Adapter) with use case
  const loginController = new LoginUserController(userLogin);

  return loginController;
}

/**
 * Alternative: Individual factory functions for each component
 * This approach gives more granular control over dependency creation
 */

/**
 * Creates the JWT Token Generation Service
 */
export function createTokenGenerationService(): JwtTokenGenerationService {
  const jwtSecret = getJwtSecretFromEnvironment();
  return new JwtTokenGenerationService(jwtSecret);
}

/**
 * Creates the Master Password Hashing Service
 */
export function createHashingService(): MasterPasswordHashingService {
  return new MasterPasswordHashingService();
}

/**
 * Creates the UserLogin use case with all dependencies
 */
export function createUserLoginUseCase(userRepository: UserRepository): UserLogin {
  const tokenService = createTokenGenerationService();
  const hashingService = createHashingService();

  return new UserLogin(userRepository, hashingService, tokenService);
}

/**
 * Creates and wires all dependencies for the Logout feature
 *
 * Dependency Graph:
 * ```
 * LogoutUserController
 *   └─> UserLogout (use case)
 *       └─> TokenBlacklistService (port)
 *           └─> InMemoryTokenBlacklistService (implementation)
 * ```
 *
 * @returns Configured LogoutUserController ready to handle HTTP requests
 *
 * Notes:
 * - Logout doesn't need UserRepository (no DB access)
 * - Uses in-memory blacklist (replace with Redis in production)
 * - Simple dependency chain compared to Login
 */
export function createLogoutUserController(): LogoutUserController {
  // Step 1: Create token blacklist service (Secondary Adapter)
  const blacklistService = createTokenBlacklistService();

  // Step 2: Create application service (Use Case) with blacklist service
  const userLogout = new UserLogout(blacklistService);

  // Step 3: Create controller (Primary Adapter) with use case
  const logoutController = new LogoutUserController(userLogout);

  return logoutController;
}

/**
 * Creates the Token Blacklist Service
 *
 * Returns an in-memory implementation for now.
 * In production, replace with RedisTokenBlacklistService.
 *
 * @returns InMemoryTokenBlacklistService instance
 */
export function createTokenBlacklistService(): TokenBlacklistService {
  return new InMemoryTokenBlacklistService();
}

/**
 * Creates the UserLogout use case with all dependencies
 *
 * @returns UserLogout instance configured with blacklist service
 */
export function createUserLogoutUseCase(): UserLogout {
  const blacklistService = createTokenBlacklistService();
  return new UserLogout(blacklistService);
}

/**
 * Creates and wires all dependencies for the Refresh Session feature
 *
 * Dependency Graph:
 * ```
 * RefreshSessionController
 *   └─> SessionRefresher (use case)
 *       ├─> TokenGenerationService (port)
 *       │   └─> JwtTokenGenerationService (implementation)
 *       └─> TokenBlacklistService (port)
 *           └─> InMemoryTokenBlacklistService (implementation)
 * ```
 *
 * @returns Configured RefreshSessionController ready to handle HTTP requests
 *
 * Notes:
 * - Refresh session needs token service for verification and generation
 * - Also needs blacklist service to check if refresh token was revoked
 * - No UserRepository needed (only token operations)
 */
export function createRefreshSessionController(): RefreshSessionController {
  // Step 1: Create infrastructure services (Secondary Adapters)
  const tokenService = createTokenGenerationService();
  const blacklistService = createTokenBlacklistService();

  // Step 2: Create application service (Use Case) with dependencies
  const sessionRefresher = new SessionRefresher(tokenService, blacklistService);

  // Step 3: Create controller (Primary Adapter) with use case
  const refreshController = new RefreshSessionController(sessionRefresher);

  return refreshController;
}

/**
 * Creates the SessionRefresher use case with all dependencies
 *
 * @returns SessionRefresher instance configured with token and blacklist services
 */
export function createSessionRefresherUseCase(): SessionRefresher {
  const tokenService = createTokenGenerationService();
  const blacklistService = createTokenBlacklistService();
  return new SessionRefresher(tokenService, blacklistService);
}

/**
 * Helper function to safely get JWT secret from environment
 *
 * @throws Error if JWT_SECRET is not configured
 */
function getJwtSecretFromEnvironment(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      'JWT_SECRET environment variable is not configured. ' +
        'Please set JWT_SECRET in your .env file.'
    );
  }

  return secret;
}

/**
 * Example usage in an Express.js application:
 *
 * ```typescript
 * import express from 'express';
 * import { createAuthRoutes } from './Contexts/Authentication/Users/infrastructure/routes/auth.routes';
 * import { createLoginUserController, createLogoutUserController } from './Contexts/Authentication/Users/infrastructure/dependencies';
 * import { TypeOrmUserRepository } from './Contexts/Authentication/Users/infrastructure/persistence/TypeOrmUserRepository';
 *
 * // Create Express app
 * const app = express();
 * app.use(express.json());
 *
 * // Create repository implementation (this would be in your app setup)
 * const userRepository = new TypeOrmUserRepository(dataSource);
 *
 * // Create controllers with all dependencies wired
 * const loginController = createLoginUserController(userRepository);
 * const logoutController = createLogoutUserController();
 *
 * // Create and register authentication routes
 * const authRouter = createAuthRoutes(loginController, logoutController);
 * app.use('/auth', authRouter);
 *
 * // Or register routes individually:
 * // app.post('/auth/login', (req, res) => loginController.run(req, res));
 * // app.post('/auth/logout', (req, res) => logoutController.run(req, res));
 *
 * // Start server
 * app.listen(3000, () => console.log('Server running on port 3000'));
 * ```
 */

/**
 * Example for testing with mocks:
 *
 * ```typescript
 * import { createUserLoginUseCase } from './dependencies';
 * import { InMemoryUserRepository } from '../../../tests/Contexts/Authentication/Users/infrastructure/InMemoryUserRepository';
 *
 * describe('UserLogin Integration Test', () => {
 *   it('should login user successfully', async () => {
 *     // Create in-memory repository for testing
 *     const userRepository = new InMemoryUserRepository();
 *
 *     // Create use case with test repository
 *     const userLogin = createUserLoginUseCase(userRepository);
 *
 *     // Add test user to repository
 *     await userRepository.save(someTestUser);
 *
 *     // Execute use case
 *     const result = await userLogin.run({
 *       email: 'test@example.com',
 *       masterPassword: 'Password123!'
 *     });
 *
 *     // Assert
 *     expect(result.userId).toBe(someTestUser.id.value);
 *     expect(result.accessToken).toBeDefined();
 *   });
 * });
 * ```
 */
