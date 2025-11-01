/**
 * Express.js Application Server
 *
 * This is the main entry point for the HTTP API application.
 * It sets up the Express server following Hexagonal Architecture principles.
 *
 * Architecture Notes:
 * - This file is in the Infrastructure Layer (Application Entry Point)
 * - It wires all dependencies together (Dependency Injection Container role)
 * - It configures the Express application and middleware
 * - It delegates to domain/application layers through properly configured adapters
 *
 * Responsibilities:
 * 1. Load environment configuration
 * 2. Create repository implementations (persistence adapters)
 * 3. Wire dependencies using factory functions
 * 4. Configure Express middleware
 * 5. Register routes
 * 6. Start the HTTP server
 *
 * What this file DOES NOT do:
 * - Business logic (that's in domain/application)
 * - HTTP request handling (that's in controllers)
 * - Data persistence logic (that's in repositories)
 */

import express, { Application } from 'express';
import dotenv from 'dotenv';
import { createAuthRoutes } from '../../Contexts/Authentication/Users/infrastructure/routes/auth.routes';
import {
  createLoginUserController,
  createLogoutUserController,
  createRefreshSessionController,
} from '../../Contexts/Authentication/Users/infrastructure/dependencies';
import { InMemoryUserRepository } from '../../../tests/Contexts/Authentication/Users/infrastructure/InMemoryUserRepository';

/**
 * Load environment variables from .env file
 *
 * This must be called BEFORE any code that uses process.env
 * to ensure all environment variables are available.
 */
dotenv.config();

/**
 * Application Configuration
 *
 * Loaded from environment variables with sensible defaults.
 * See .env.example for all available configuration options.
 */
const CONFIG = {
  PORT: parseInt(process.env.PORT ?? '3000', 10),
  NODE_ENV: process.env.NODE_ENV ?? 'development',
} as const;

/**
 * Creates and configures the Express application
 *
 * This function:
 * 1. Creates Express app instance
 * 2. Configures middleware (JSON parsing, CORS, etc.)
 * 3. Wires all dependencies
 * 4. Registers routes
 *
 * Separation of concerns:
 * - App creation is separate from server start
 * - This allows easier testing (can create app without starting server)
 * - Dependencies are wired in a single place
 *
 * @returns Configured Express application
 */
function createApp(): Application {
  const app = express();

  // ============================================================================
  // Middleware Configuration
  // ============================================================================

  /**
   * JSON Body Parser
   * Parses incoming requests with JSON payloads
   * Required for POST/PUT requests with JSON bodies
   */
  app.use(express.json());

  /**
   * URL-encoded Body Parser
   * Parses incoming requests with URL-encoded payloads
   * Required for traditional HTML form submissions
   */
  app.use(express.urlencoded({ extended: true }));

  // ============================================================================
  // Dependency Injection - Create Infrastructure Adapters
  // ============================================================================

  /**
   * User Repository - Secondary Adapter (Persistence)
   *
   * Current: InMemoryUserRepository (for development/testing)
   * Future: Replace with TypeOrmUserRepository, MongoUserRepository, etc.
   *
   * Example for production:
   * ```typescript
   * import { TypeOrmUserRepository } from '../../Contexts/Authentication/Users/infrastructure/persistence/TypeOrmUserRepository';
   * const userRepository = new TypeOrmUserRepository(dataSource);
   * ```
   */
  const userRepository = new InMemoryUserRepository();

  // ============================================================================
  // Dependency Injection - Create Controllers
  // ============================================================================

  /**
   * Create controllers with all dependencies wired
   *
   * The factory functions (from dependencies.ts) handle:
   * - Creating all required services
   * - Injecting dependencies in the correct order
   * - Ensuring proper configuration from environment
   */
  const loginController = createLoginUserController(userRepository);
  const logoutController = createLogoutUserController();
  const refreshController = createRefreshSessionController();

  // ============================================================================
  // Route Registration
  // ============================================================================

  /**
   * Health Check Endpoint
   *
   * Simple endpoint to verify the server is running.
   * Useful for:
   * - Load balancers (health checks)
   * - Monitoring systems
   * - Quick verification during development
   */
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: CONFIG.NODE_ENV,
    });
  });

  /**
   * Authentication Routes
   *
   * Registers all authentication-related endpoints:
   * - POST /auth/login - User login
   * - POST /auth/logout - User logout
   * - POST /auth/refresh - Refresh session
   */
  const authRouter = createAuthRoutes(loginController, logoutController, refreshController);
  app.use('/auth', authRouter);

  /**
   * Future routes can be added here:
   *
   * Example:
   * ```typescript
   * import { createUserRoutes } from '../../Contexts/UserManagement/infrastructure/routes/user.routes';
   * const userRouter = createUserRoutes(...dependencies);
   * app.use('/users', userRouter);
   * ```
   */

  // ============================================================================
  // Error Handling Middleware (Optional - can be enhanced)
  // ============================================================================

  /**
   * 404 Not Found Handler
   *
   * Catches all requests that don't match any defined routes.
   * Returns a consistent JSON response for unknown endpoints.
   */
  app.use((req, res) => {
    res.status(404).json({
      error: 'Not Found',
      message: `Cannot ${req.method} ${req.path}`,
      path: req.path,
    });
  });

  return app;
}

/**
 * Starts the HTTP server
 *
 * This function:
 * 1. Creates the configured Express app
 * 2. Starts listening on the configured port
 * 3. Logs startup information
 * 4. Handles server errors
 *
 * @returns Promise that resolves when server is listening
 */
async function startServer(): Promise<void> {
  try {
    // Validate critical environment variables
    validateEnvironment();

    // Create Express application
    const app = createApp();

    // Start HTTP server
    app.listen(CONFIG.PORT, () => {
      console.log('='.repeat(60));
      console.log('🚀 Password Manager API Server');
      console.log('='.repeat(60));
      console.log(`Environment: ${CONFIG.NODE_ENV}`);
      console.log(`Port: ${CONFIG.PORT}`);
      console.log(`Server URL: http://localhost:${CONFIG.PORT}`);
      console.log(`Health Check: http://localhost:${CONFIG.PORT}/health`);
      console.log('='.repeat(60));
      console.log('Available Endpoints:');
      console.log(`  POST http://localhost:${CONFIG.PORT}/auth/login`);
      console.log(`  POST http://localhost:${CONFIG.PORT}/auth/logout`);
      console.log(`  POST http://localhost:${CONFIG.PORT}/auth/refresh`);
      console.log('='.repeat(60));
      console.log('Server is ready to accept connections');
      console.log('Press Ctrl+C to stop the server');
      console.log('='.repeat(60));
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

/**
 * Validates required environment variables
 *
 * Throws an error if critical configuration is missing.
 * This ensures the application fails fast on startup rather than
 * encountering errors during runtime.
 *
 * @throws Error if required environment variables are missing
 */
function validateEnvironment(): void {
  const required = ['JWT_SECRET'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
        'Please create a .env file based on .env.example and set all required variables.'
    );
  }

  // Validate JWT_SECRET length (should be at least 32 characters)
  const jwtSecret = process.env.JWT_SECRET as string;
  if (jwtSecret.length < 32) {
    console.warn(
      '⚠️  WARNING: JWT_SECRET is less than 32 characters. ' +
        'This is not recommended for production. ' +
        'Please use a longer, cryptographically secure secret.'
    );
  }
}

/**
 * Graceful Shutdown Handler
 *
 * Handles SIGINT (Ctrl+C) and SIGTERM signals to allow
 * graceful shutdown of the server.
 *
 * This ensures:
 * - Active connections are allowed to complete
 * - Resources are properly cleaned up
 * - Database connections are closed
 */
function setupGracefulShutdown(): void {
  const shutdown = (signal: string): void => {
    console.log(`\n${signal} received. Shutting down gracefully...`);

    // Here you would:
    // 1. Close database connections
    // 2. Close any open file handles
    // 3. Cancel pending jobs
    // 4. Wait for active requests to complete

    console.log('Server stopped.');
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

/**
 * Error Handler for Unhandled Rejections
 *
 * Catches any unhandled promise rejections to prevent
 * the application from crashing silently.
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // In production, you might want to:
  // 1. Log to error tracking service (Sentry, etc.)
  // 2. Gracefully shutdown the server
  // 3. Restart via process manager (PM2, etc.)
});

/**
 * Error Handler for Uncaught Exceptions
 *
 * Catches any uncaught exceptions to log them before
 * the application crashes.
 */
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // In production, you should:
  // 1. Log to error tracking service
  // 2. Gracefully shutdown
  // 3. Let process manager restart the app
  process.exit(1);
});

// ============================================================================
// Application Bootstrap
// ============================================================================

/**
 * Start the application
 *
 * This is the entry point when running the server.
 * It sets up error handlers and starts the server.
 */
if (require.main === module) {
  setupGracefulShutdown();
  void startServer();
}

/**
 * Export for testing
 *
 * Allows tests to import and create the app without starting the server.
 *
 * Example test:
 * ```typescript
 * import request from 'supertest';
 * import { createApp } from './server';
 *
 * const app = createApp();
 * await request(app).get('/health').expect(200);
 * ```
 */
export { createApp };
