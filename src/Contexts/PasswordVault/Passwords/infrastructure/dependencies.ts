/**
 * Dependency Injection Setup for PasswordVault/Passwords Context
 *
 * This file demonstrates how to wire dependencies for the Password Entry features
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

import { PasswordEntryCreator } from '../application/Create/PasswordEntryCreator';
import { PasswordEntriesLister } from '../application/List/PasswordEntriesLister';
import { PasswordEntryRepository } from '../domain/PasswordEntryRepository';
import { PasswordEncryptionService } from '../domain/PasswordEncryptionService';
import { InMemoryPasswordEntryRepository } from './persistence/InMemoryPasswordEntryRepository';
import { CreatePasswordEntryController } from './http/controllers/CreatePasswordEntryController';
import { ListPasswordEntriesController } from './http/controllers/ListPasswordEntriesController';
import { PasswordEncryptionService as AuthPasswordEncryptionService } from '../../../Authentication/Users/application/ports/PasswordEncryptionService';
import { createPasswordEncryptionServiceAdapter } from './PasswordEncryptionServiceAdapter';

// TypeORM dependencies (optional - only needed if using TypeORM)
// These are commented out to avoid compilation errors when TypeORM is not installed
// import { Repository } from 'typeorm';
// import { TypeOrmPasswordEntryRepository } from './persistence/typeorm/TypeOrmPasswordEntryRepository';
// import { PasswordEntryEntity } from './persistence/typeorm/PasswordEntryEntity';

/**
 * Creates and wires all dependencies for the Create Password Entry feature (TypeORM version)
 *
 * NOTE: This function is commented out because TypeORM is not installed.
 * Uncomment when you want to use TypeORM for persistence.
 *
 * Dependency Graph:
 * ```
 * CreatePasswordEntryController
 *   └─> PasswordEntryCreator (use case)
 *       ├─> PasswordEntryRepository (port)
 *       │   └─> TypeOrmPasswordEntryRepository (implementation)
 *       └─> PasswordEncryptionService (port - from domain, implemented in Authentication context)
 * ```
 *
 * @param typeormRepository - TypeORM repository for PasswordEntryEntity
 * @param passwordEncryptionService - Service to encrypt passwords (from Authentication context)
 * @returns Configured CreatePasswordEntryController ready to handle HTTP requests
 *
 * Note: passwordEncryptionService is implemented in Authentication context
 * (PasswordEncryptionServiceImpl) but satisfies the port defined in PasswordVault domain.
 * This is a cross-context integration following Hexagonal Architecture.
 */
/*
export function createCreatePasswordEntryController(
  typeormRepository: Repository<PasswordEntryEntity>,
  passwordEncryptionService: PasswordEncryptionService
): CreatePasswordEntryController {
  // Step 1: Create domain repository adapter (Secondary Adapter)
  const passwordEntryRepository = new TypeOrmPasswordEntryRepository(typeormRepository);

  // Step 2: Create application service (Use Case) with all dependencies
  const passwordEntryCreator = new PasswordEntryCreator(
    passwordEntryRepository,
    passwordEncryptionService
  );

  // Step 3: Create controller (Primary Adapter) with use case
  const createController = new CreatePasswordEntryController(passwordEntryCreator);

  return createController;
}
*/

/**
 * Alternative: Create repository separately for reuse (TypeORM version)
 *
 * NOTE: This function is commented out because TypeORM is not installed.
 *
 * This is useful when you need the repository in multiple places
 * (e.g., different controllers or use cases)
 *
 * @param typeormRepository - TypeORM repository for PasswordEntryEntity
 * @returns Domain repository implementation
 */
/*
export function createPasswordEntryRepository(
  typeormRepository: Repository<PasswordEntryEntity>
): PasswordEntryRepository {
  return new TypeOrmPasswordEntryRepository(typeormRepository);
}
*/

/**
 * Alternative: Create use case separately for reuse
 *
 * This is useful when you need the use case in multiple controllers
 * or when testing the use case directly
 *
 * @param passwordEntryRepository - Repository implementation
 * @param passwordEncryptionService - Encryption service
 * @returns PasswordEntryCreator use case
 */
export function createPasswordEntryCreatorUseCase(
  passwordEntryRepository: PasswordEntryRepository,
  passwordEncryptionService: PasswordEncryptionService
): PasswordEntryCreator {
  return new PasswordEntryCreator(passwordEntryRepository, passwordEncryptionService);
}

/**
 * Creates controller with In-Memory repository (for development/testing)
 *
 * This is a simplified factory for development and testing that doesn't require
 * TypeORM or database setup. Perfect for:
 * - Local development
 * - Testing
 * - Demos
 * - CI/CD environments
 *
 * Dependency Graph:
 * ```
 * CreatePasswordEntryController
 *   └─> PasswordEntryCreator (use case)
 *       ├─> InMemoryPasswordEntryRepository (in-memory implementation)
 *       └─> PasswordEncryptionServiceAdapter (adapts Auth service to Vault interface)
 *           └─> PasswordEncryptionServiceImpl (from Authentication context)
 * ```
 *
 * @param authEncryptionService - Authentication context's encryption service
 * @returns Configured CreatePasswordEntryController with in-memory persistence
 *
 * Example usage:
 * ```typescript
 * import { PasswordEncryptionServiceImpl } from '../../../Authentication/Users/infrastructure/PasswordEncryptionServiceImpl';
 * const authEncryptionService = new PasswordEncryptionServiceImpl();
 * const controller = createCreatePasswordEntryControllerInMemory(authEncryptionService);
 * ```
 */
export function createCreatePasswordEntryControllerInMemory(
  authEncryptionService: AuthPasswordEncryptionService
): CreatePasswordEntryController {
  // Step 1: Create in-memory repository (no database required)
  const passwordEntryRepository = new InMemoryPasswordEntryRepository();

  // Step 2: Adapt Authentication service to PasswordVault interface
  const passwordEncryptionService =
    createPasswordEncryptionServiceAdapter(authEncryptionService);

  // Step 3: Create application service (Use Case) with all dependencies
  const passwordEntryCreator = new PasswordEntryCreator(
    passwordEntryRepository,
    passwordEncryptionService
  );

  // Step 4: Create controller (Primary Adapter) with use case
  const createController = new CreatePasswordEntryController(passwordEntryCreator);

  return createController;
}

/**
 * Creates in-memory repository instance
 *
 * Useful for:
 * - Testing (each test gets fresh repository)
 * - Development (no database setup needed)
 * - Sharing repository across multiple controllers
 *
 * @returns In-memory implementation of PasswordEntryRepository
 *
 * Example usage:
 * ```typescript
 * const repository = createInMemoryPasswordEntryRepository();
 * const creator = new PasswordEntryCreator(repository, encryptionService);
 * const finder = new PasswordEntryFinder(repository);
 * ```
 */
export function createInMemoryPasswordEntryRepository(): PasswordEntryRepository {
  return new InMemoryPasswordEntryRepository();
}

/**
 * Creates ListPasswordEntriesController with in-memory repository (for development/testing)
 *
 * This factory creates the controller for listing password entries with pagination,
 * sorting, and filtering capabilities.
 *
 * Dependency Graph:
 * ```
 * ListPasswordEntriesController
 *   └─> PasswordEntriesLister (use case)
 *       └─> PasswordEntryRepository (port)
 *           └─> InMemoryPasswordEntryRepository (in-memory implementation)
 * ```
 *
 * @returns Configured ListPasswordEntriesController with in-memory persistence
 *
 * Example usage:
 * ```typescript
 * const listController = createListPasswordEntriesControllerInMemory();
 * app.get('/api/passwords', authenticateJWT, (req, res) => listController.run(req, res));
 * ```
 */
export function createListPasswordEntriesControllerInMemory(): ListPasswordEntriesController {
  // Step 1: Create in-memory repository (no database required)
  const passwordEntryRepository = new InMemoryPasswordEntryRepository();

  // Step 2: Create application service (Use Case) with repository dependency
  const passwordEntriesLister = new PasswordEntriesLister(passwordEntryRepository);

  // Step 3: Create controller (Primary Adapter) with use case
  const listController = new ListPasswordEntriesController(passwordEntriesLister);

  return listController;
}

/**
 * Alternative: Create ListPasswordEntriesController with shared repository
 *
 * This is useful when you want to share the same repository instance across
 * multiple controllers (e.g., create and list controllers using the same in-memory data).
 *
 * @param passwordEntryRepository - Shared repository instance
 * @returns Configured ListPasswordEntriesController
 *
 * Example usage:
 * ```typescript
 * const repository = createInMemoryPasswordEntryRepository();
 * const createController = createCreatePasswordEntryControllerWithRepository(repository, encryptionService);
 * const listController = createListPasswordEntriesControllerWithRepository(repository);
 * // Both controllers now share the same in-memory data
 * ```
 */
export function createListPasswordEntriesControllerWithRepository(
  passwordEntryRepository: PasswordEntryRepository
): ListPasswordEntriesController {
  // Step 1: Create application service (Use Case) with repository dependency
  const passwordEntriesLister = new PasswordEntriesLister(passwordEntryRepository);

  // Step 2: Create controller (Primary Adapter) with use case
  const listController = new ListPasswordEntriesController(passwordEntriesLister);

  return listController;
}

/**
 * Example usage in an Express.js application:
 *
 * ```typescript
 * import express from 'express';
 * import { DataSource } from 'typeorm';
 * import { createPasswordsRoutes } from './Contexts/PasswordVault/Passwords/infrastructure/http/routes/passwords.routes';
 * import { createCreatePasswordEntryController } from './Contexts/PasswordVault/Passwords/infrastructure/dependencies';
 * import { PasswordEntryEntity } from './Contexts/PasswordVault/Passwords/infrastructure/persistence/typeorm/PasswordEntryEntity';
 * import { PasswordEncryptionServiceImpl } from './Contexts/Authentication/Users/infrastructure/PasswordEncryptionServiceImpl';
 *
 * // Create Express app
 * const app = express();
 * app.use(express.json());
 *
 * // Create TypeORM DataSource
 * const dataSource = new DataSource({
 *   type: 'postgres',
 *   host: 'localhost',
 *   port: 5432,
 *   username: 'user',
 *   password: 'pass',
 *   database: 'password_manager',
 *   entities: [PasswordEntryEntity],
 *   synchronize: false, // Use migrations in production!
 * });
 *
 * await dataSource.initialize();
 *
 * // Get TypeORM repository
 * const typeormRepo = dataSource.getRepository(PasswordEntryEntity);
 *
 * // Create encryption service (from Authentication context)
 * const encryptionService = new PasswordEncryptionServiceImpl();
 *
 * // Create controller with all dependencies wired
 * const createController = createCreatePasswordEntryController(
 *   typeormRepo,
 *   encryptionService
 * );
 *
 * // Create and register routes
 * const passwordsRouter = createPasswordsRoutes(createController);
 * app.use('/api/passwords', passwordsRouter);
 *
 * // Start server
 * app.listen(3000, () => console.log('Server running on port 3000'));
 * ```
 */

/**
 * Example for testing with mocks:
 *
 * ```typescript
 * import { createPasswordEntryCreatorUseCase } from './dependencies';
 * import { InMemoryPasswordEntryRepository } from '../../../../tests/Contexts/PasswordVault/Passwords/infrastructure/InMemoryPasswordEntryRepository';
 * import { MockPasswordEncryptionService } from '../../../../tests/Contexts/PasswordVault/Passwords/infrastructure/MockPasswordEncryptionService';
 *
 * describe('PasswordEntryCreator Integration Test', () => {
 *   it('should create password entry successfully', async () => {
 *     // Create in-memory repository for testing
 *     const repository = new InMemoryPasswordEntryRepository();
 *
 *     // Create mock encryption service
 *     const encryptionService = new MockPasswordEncryptionService();
 *
 *     // Create use case with test dependencies
 *     const useCase = createPasswordEntryCreatorUseCase(repository, encryptionService);
 *
 *     // Execute use case
 *     const result = await useCase.run({
 *       userId: 'user-123',
 *       siteName: 'GitHub',
 *       username: 'johndoe',
 *       password: 'MyPassword123!',
 *       category: 'WORK',
 *     });
 *
 *     // Assert
 *     expect(result.id).toBeDefined();
 *     expect(result.siteName).toBe('GitHub');
 *
 *     // Verify entry was saved to repository
 *     const saved = await repository.findById(new PasswordEntryId(result.id));
 *     expect(saved).toBeDefined();
 *   });
 * });
 * ```
 */

/**
 * Cross-Context Integration Notes:
 *
 * PasswordEncryptionService:
 * - Port (interface) is defined in PasswordVault/Passwords/domain
 * - Implementation is in Authentication/Users/infrastructure
 * - This follows Dependency Inversion Principle
 * - PasswordVault doesn't depend on Authentication (only on interface)
 *
 * How to handle cross-context dependencies:
 *
 * Option 1: Import implementation directly (current approach)
 * ```typescript
 * import { PasswordEncryptionServiceImpl } from '../../../Authentication/Users/infrastructure/PasswordEncryptionServiceImpl';
 * const service = new PasswordEncryptionServiceImpl();
 * ```
 *
 * Option 2: Use Shared Kernel
 * - Move implementation to Shared context
 * - Both contexts depend on Shared
 * - Better for services used by multiple contexts
 *
 * Option 3: Dependency Injection Container
 * - Use IoC container (e.g., InversifyJS, TypeDI)
 * - Register implementations in container
 * - Resolve dependencies automatically
 *
 * Option 4: Factory Pattern
 * - Create factory in Shared context
 * - Factory knows about all implementations
 * - Contexts request services from factory
 *
 * Current choice (Option 1) is simplest and works well for small projects.
 * Consider Option 3 or 4 for larger projects with many cross-context dependencies.
 */

/**
 * Future Dependencies to Add:
 *
 * When implementing additional features, add factory functions here:
 *
 * 1. Get Password Entry:
 * ```typescript
 * export function createGetPasswordEntryController(
 *   typeormRepository: Repository<PasswordEntryEntity>,
 *   passwordEncryptionService: PasswordEncryptionService
 * ): GetPasswordEntryController {
 *   const repository = new TypeOrmPasswordEntryRepository(typeormRepository);
 *   const finder = new PasswordEntryFinder(repository);
 *   const decryptor = new PasswordDecryptor(passwordEncryptionService);
 *   return new GetPasswordEntryController(finder, decryptor);
 * }
 * ```
 *
 * 2. Update Password Entry:
 * ```typescript
 * export function createUpdatePasswordEntryController(
 *   typeormRepository: Repository<PasswordEntryEntity>,
 *   passwordEncryptionService: PasswordEncryptionService
 * ): UpdatePasswordEntryController {
 *   const repository = new TypeOrmPasswordEntryRepository(typeormRepository);
 *   const updater = new PasswordEntryUpdater(repository, passwordEncryptionService);
 *   return new UpdatePasswordEntryController(updater);
 * }
 * ```
 *
 * 3. Delete Password Entry:
 * ```typescript
 * export function createDeletePasswordEntryController(
 *   typeormRepository: Repository<PasswordEntryEntity>
 * ): DeletePasswordEntryController {
 *   const repository = new TypeOrmPasswordEntryRepository(typeormRepository);
 *   const deleter = new PasswordEntryDeleter(repository);
 *   return new DeletePasswordEntryController(deleter);
 * }
 * ```
 *
 * 4. List Password Entries:
 * ```typescript
 * export function createListPasswordEntriesController(
 *   typeormRepository: Repository<PasswordEntryEntity>
 * ): ListPasswordEntriesController {
 *   const repository = new TypeOrmPasswordEntryRepository(typeormRepository);
 *   const lister = new PasswordEntriesLister(repository);
 *   return new ListPasswordEntriesController(lister);
 * }
 * ```
 */
