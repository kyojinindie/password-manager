/**
 * Infrastructure Layer Barrel Export
 *
 * This file exports all public components from the infrastructure layer.
 * It serves as the single entry point for importing infrastructure components.
 *
 * Architecture Notes:
 * - Infrastructure layer contains adapters (primary and secondary)
 * - Primary adapters: Controllers, Routes (input ports)
 * - Secondary adapters: Repositories, Services (output ports)
 * - Only export what's needed by application setup (server.ts)
 * - Internal components (mappers, entities) remain private
 *
 * What to export:
 * - Controllers (for route configuration)
 * - Route factory functions (for app setup)
 * - Dependency injection factory functions (for wiring)
 * - Repository implementations (for dependency injection)
 *
 * What NOT to export:
 * - TypeORM entities (internal to repository)
 * - Mappers (internal to repository)
 * - Private implementation details
 */

// ============================================================================
// HTTP Layer - Primary Adapters (Input)
// ============================================================================

/**
 * Controllers
 * These handle HTTP requests and delegate to application services
 */
export { CreatePasswordEntryController } from './http/controllers/CreatePasswordEntryController';

/**
 * Routes
 * These wire controllers to HTTP endpoints
 */
export { createPasswordsRoutes } from './http/routes/passwords.routes';

// ============================================================================
// Persistence Layer - Secondary Adapters (Output)
// ============================================================================

/**
 * Repository Implementations
 * These implement the domain repository port
 */
// TypeORM implementation (commented out - not installed)
// export { TypeOrmPasswordEntryRepository } from './persistence/typeorm/TypeOrmPasswordEntryRepository';
// export { PasswordEntryEntity } from './persistence/typeorm/PasswordEntryEntity';

// In-Memory implementation (for development/testing)
export { InMemoryPasswordEntryRepository } from './persistence/InMemoryPasswordEntryRepository';

// Note: We DON'T export PasswordEntryMapper because it's private to the repository
// The mapper is an internal implementation detail that should not be used outside

// ============================================================================
// Dependency Injection
// ============================================================================

/**
 * Factory Functions
 * These wire dependencies together following DI principles
 */
export {
  // createCreatePasswordEntryController, // TypeORM version - commented out
  // createPasswordEntryRepository, // TypeORM version - commented out
  createPasswordEntryCreatorUseCase,
  createCreatePasswordEntryControllerInMemory,
  createInMemoryPasswordEntryRepository,
} from './dependencies';

/**
 * Usage Examples:
 *
 * Example 1: Wire everything in server.ts
 * ```typescript
 * import { DataSource } from 'typeorm';
 * import {
 *   createPasswordsRoutes,
 *   createCreatePasswordEntryController,
 *   PasswordEntryEntity
 * } from './Contexts/PasswordVault/Passwords/infrastructure';
 *
 * // Initialize TypeORM
 * const dataSource = new DataSource({
 *   entities: [PasswordEntryEntity],
 *   // ... other config
 * });
 * await dataSource.initialize();
 *
 * // Get TypeORM repository
 * const typeormRepo = dataSource.getRepository(PasswordEntryEntity);
 *
 * // Create encryption service
 * const encryptionService = createPasswordEncryptionService();
 *
 * // Create controller
 * const createController = createCreatePasswordEntryController(
 *   typeormRepo,
 *   encryptionService
 * );
 *
 * // Create and mount routes
 * const passwordsRouter = createPasswordsRoutes(createController);
 * app.use('/api/passwords', passwordsRouter);
 * ```
 *
 * Example 2: Use in tests
 * ```typescript
 * import { createPasswordEntryCreatorUseCase } from './infrastructure';
 * import { InMemoryPasswordEntryRepository } from './infrastructure/InMemoryPasswordEntryRepository';
 *
 * const repository = new InMemoryPasswordEntryRepository();
 * const useCase = createPasswordEntryCreatorUseCase(repository, mockEncryptionService);
 * ```
 */

/**
 * Future exports to add as features are implemented:
 *
 * // Get Password Entry
 * export { GetPasswordEntryController } from './http/controllers/GetPasswordEntryController';
 * export { createGetPasswordEntryController } from './dependencies';
 *
 * // Update Password Entry
 * export { UpdatePasswordEntryController } from './http/controllers/UpdatePasswordEntryController';
 * export { createUpdatePasswordEntryController } from './dependencies';
 *
 * // Delete Password Entry
 * export { DeletePasswordEntryController } from './http/controllers/DeletePasswordEntryController';
 * export { createDeletePasswordEntryController } from './dependencies';
 *
 * // List Password Entries
 * export { ListPasswordEntriesController } from './http/controllers/ListPasswordEntriesController';
 * export { createListPasswordEntriesController } from './dependencies';
 */
