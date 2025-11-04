# PasswordVault/Passwords - Infrastructure Layer

This directory contains the **Infrastructure Layer** for the Password Entry feature following **Hexagonal Architecture** principles.

## Overview

The infrastructure layer contains **adapters** that connect the application core (domain + application layers) with external technologies and systems.

### Architecture Principles

- **Dependency Inversion**: Infrastructure depends on domain/application, never the reverse
- **Technology Encapsulation**: All technology-specific details are hidden from the core
- **Thin Adapters**: Adapters only translate, they don't contain business logic
- **Explicit Contracts**: Implements ports (interfaces) defined by domain/application layers

## Directory Structure

```
infrastructure/
├── persistence/
│   └── typeorm/
│       ├── PasswordEntryEntity.ts       # TypeORM database entity
│       ├── PasswordEntryMapper.ts       # Domain ↔ Persistence translation
│       └── TypeOrmPasswordEntryRepository.ts  # Repository implementation
├── http/
│   ├── controllers/
│   │   └── CreatePasswordEntryController.ts   # HTTP request handler
│   └── routes/
│       └── passwords.routes.ts          # Route configuration
├── dependencies.ts                      # Dependency injection wiring
├── index.ts                            # Barrel export
└── README.md                           # This file
```

## Components

### 1. Primary Adapters (Input/Driving)

Primary adapters receive requests from the outside world and translate them into application service calls.

#### CreatePasswordEntryController

**Location**: `http/controllers/CreatePasswordEntryController.ts`

**Purpose**: Handles `POST /api/passwords` HTTP requests

**Responsibilities**:
- Extract userId from JWT token (authentication)
- Validate request format (not business rules)
- Delegate to `PasswordEntryCreator` use case
- Format response as JSON
- Map domain exceptions to HTTP status codes

**HTTP Endpoint**:
```
POST /api/passwords
Authorization: Bearer <jwt-token>
Content-Type: application/json

Request Body:
{
  "siteName": "GitHub",
  "siteUrl": "https://github.com",       // Optional
  "username": "john.doe@email.com",
  "password": "MySecurePassword123!",    // Plain text
  "category": "WORK",
  "notes": "My work account",            // Optional
  "tags": ["important", "2fa"]           // Optional
}

Response (201 Created):
{
  "id": "uuid",
  "siteName": "GitHub",
  "siteUrl": "https://github.com",
  "username": "john.doe@email.com",
  "category": "WORK",
  "notes": "My work account",
  "tags": ["important", "2fa"],
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Codes**:
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Missing/invalid JWT
- `500 Internal Server Error`: Unexpected errors

### 2. Secondary Adapters (Output/Driven)

Secondary adapters implement ports defined by the domain/application layers to interact with external systems.

#### TypeOrmPasswordEntryRepository

**Location**: `persistence/typeorm/TypeOrmPasswordEntryRepository.ts`

**Purpose**: Implements `PasswordEntryRepository` port using TypeORM

**Implements**:
```typescript
interface PasswordEntryRepository {
  save(passwordEntry: PasswordEntry): Promise<void>;
  findById(id: PasswordEntryId): Promise<PasswordEntry | null>;
  findByUserId(userId: string): Promise<PasswordEntry[]>;
  delete(id: PasswordEntryId, userId: string): Promise<boolean>;
}
```

**Technology**: TypeORM (PostgreSQL/MySQL/SQLite compatible)

**Key Features**:
- Translates between domain aggregates and database entities
- Enforces authorization (user can only access their own entries)
- Handles database errors gracefully
- Uses mapper to keep domain clean

#### PasswordEntryEntity

**Location**: `persistence/typeorm/PasswordEntryEntity.ts`

**Purpose**: TypeORM entity representing database table schema

**Table**: `password_entries`

**Schema**:
```sql
CREATE TABLE password_entries (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  site_name VARCHAR(100) NOT NULL,
  site_url VARCHAR(2048),
  username VARCHAR(100) NOT NULL,
  encrypted_password TEXT NOT NULL,
  category VARCHAR(20) NOT NULL,
  notes VARCHAR(1000),
  tags JSON NOT NULL DEFAULT '[]',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_password_entries_user_id ON password_entries(user_id);
CREATE INDEX idx_password_entries_category ON password_entries(category);
CREATE INDEX idx_password_entries_created_at ON password_entries(created_at DESC);
```

**Important**: This is a **persistence model**, NOT a domain model. It's internal to the repository and never exposed outside.

#### PasswordEntryMapper

**Location**: `persistence/typeorm/PasswordEntryMapper.ts`

**Purpose**: Translates between domain and persistence models

**Methods**:
- `toEntity(domain)`: Domain aggregate → TypeORM entity (for saving)
- `toDomain(entity)`: TypeORM entity → Domain aggregate (for loading)

**Why separate models?**
- Domain model: Rich behavior, immutability, Value Objects
- Persistence model: Anemic data, primitives, ORM annotations
- Allows independent evolution of domain and database

### 3. Route Configuration

#### passwords.routes.ts

**Location**: `http/routes/passwords.routes.ts`

**Purpose**: Configures HTTP routes for password entries

**Factory Function**:
```typescript
export function createPasswordsRoutes(
  createController: CreatePasswordEntryController
): Router
```

**Routes**:
- `POST /` - Create password entry (implemented)
- `GET /` - List all entries (future)
- `GET /:id` - Get specific entry (future)
- `PUT /:id` - Update entry (future)
- `DELETE /:id` - Delete entry (future)

**Authentication**: All routes require JWT authentication (to be added)

### 4. Dependency Injection

#### dependencies.ts

**Location**: `dependencies.ts`

**Purpose**: Wires all dependencies together following DI principles

**Factory Functions**:

```typescript
// Create fully configured controller
export function createCreatePasswordEntryController(
  typeormRepository: Repository<PasswordEntryEntity>,
  passwordEncryptionService: PasswordEncryptionService
): CreatePasswordEntryController

// Create repository separately
export function createPasswordEntryRepository(
  typeormRepository: Repository<PasswordEntryEntity>
): PasswordEntryRepository

// Create use case separately
export function createPasswordEntryCreatorUseCase(
  passwordEntryRepository: PasswordEntryRepository,
  passwordEncryptionService: PasswordEncryptionService
): PasswordEntryCreator
```

## Integration

### How to integrate in server.ts

```typescript
import { DataSource } from 'typeorm';
import {
  createPasswordsRoutes,
  createCreatePasswordEntryController,
  PasswordEntryEntity
} from './Contexts/PasswordVault/Passwords/infrastructure';
import { PasswordEncryptionServiceImpl } from './Contexts/Authentication/Users/infrastructure/PasswordEncryptionServiceImpl';

// 1. Initialize TypeORM
const dataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'user',
  password: 'pass',
  database: 'password_manager',
  entities: [PasswordEntryEntity], // Register entity
  synchronize: false, // Use migrations in production!
});

await dataSource.initialize();

// 2. Get TypeORM repository
const typeormRepo = dataSource.getRepository(PasswordEntryEntity);

// 3. Create encryption service (cross-context dependency)
const encryptionService = new PasswordEncryptionServiceImpl();

// 4. Create controller with all dependencies wired
const createController = createCreatePasswordEntryController(
  typeormRepo,
  encryptionService
);

// 5. Create and mount routes
const passwordsRouter = createPasswordsRoutes(createController);
app.use('/api/passwords', passwordsRouter);
```

### Authentication Middleware

**IMPORTANT**: All routes require authentication. You need to add JWT middleware:

```typescript
import jwt from 'jsonwebtoken';

function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: decoded.userId };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Apply to all password routes
app.use('/api/passwords', authenticateJWT, passwordsRouter);
```

## Cross-Context Integration

### PasswordEncryptionService

The `PasswordEncryptionService` is a cross-context dependency:

- **Port (interface)**: Defined in `PasswordVault/Passwords/domain/PasswordEncryptionService.ts`
- **Implementation**: In `Authentication/Users/infrastructure/PasswordEncryptionServiceImpl.ts`

This follows **Dependency Inversion Principle**:
- PasswordVault domain defines what it needs (interface)
- Authentication context provides implementation
- PasswordVault doesn't depend on Authentication directly

## Testing

### Unit Tests

Test each component in isolation with mocks:

```typescript
// Test controller
describe('CreatePasswordEntryController', () => {
  it('should return 401 if not authenticated', async () => {
    const mockUseCase = mock<PasswordEntryCreator>();
    const controller = new CreatePasswordEntryController(mockUseCase);

    const req = { user: undefined, body: {} };
    const res = mockResponse();

    await controller.run(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });
});

// Test repository
describe('TypeOrmPasswordEntryRepository', () => {
  it('should save password entry to database', async () => {
    const mockTypeOrmRepo = mock<Repository<PasswordEntryEntity>>();
    const repository = new TypeOrmPasswordEntryRepository(mockTypeOrmRepo);

    const entry = PasswordEntryMother.random();
    await repository.save(entry);

    expect(mockTypeOrmRepo.save).toHaveBeenCalled();
  });
});
```

### Integration Tests

Test the full stack with a real database:

```typescript
describe('POST /api/passwords - Integration', () => {
  let app: Express;
  let dataSource: DataSource;

  beforeAll(async () => {
    // Set up test database
    dataSource = await createTestDataSource();
    app = createTestApp(dataSource);
  });

  it('should create password entry successfully', async () => {
    const response = await request(app)
      .post('/api/passwords')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        siteName: 'GitHub',
        username: 'johndoe',
        password: 'MyPassword123!',
        category: 'WORK',
      })
      .expect(201);

    expect(response.body).toMatchObject({
      siteName: 'GitHub',
      username: 'johndoe',
      category: 'WORK',
    });
    expect(response.body.password).toBeUndefined(); // Security check
  });
});
```

## Security Considerations

1. **Password Handling**:
   - Password sent in plain text over HTTPS (encrypted in transit)
   - Never logged or included in error messages
   - Encrypted before storage using user's master password
   - Never returned in HTTP responses

2. **Authentication**:
   - All endpoints require valid JWT token
   - UserId extracted from verified token
   - User can only create entries for themselves

3. **Authorization**:
   - Repository enforces data access rules
   - User can only access their own entries
   - Foreign key constraint prevents orphan entries

4. **Input Validation**:
   - Format validation in controller (basic checks)
   - Business validation in domain layer (Value Objects)
   - Database constraints as last defense

## Database Migrations

Create migration for password_entries table:

```bash
npm run typeorm migration:create -- src/migrations/CreatePasswordEntriesTable
```

Edit the migration file:

```typescript
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreatePasswordEntriesTable1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'password_entries',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true },
          { name: 'user_id', type: 'uuid', isNullable: false },
          { name: 'site_name', type: 'varchar', length: '100', isNullable: false },
          { name: 'site_url', type: 'varchar', length: '2048', isNullable: true },
          { name: 'username', type: 'varchar', length: '100', isNullable: false },
          { name: 'encrypted_password', type: 'text', isNullable: false },
          { name: 'category', type: 'varchar', length: '20', isNullable: false },
          { name: 'notes', type: 'varchar', length: '1000', isNullable: true },
          { name: 'tags', type: 'json', isNullable: false, default: '\'[]\''},
          { name: 'created_at', type: 'timestamp', default: 'now()', isNullable: false },
          { name: 'updated_at', type: 'timestamp', default: 'now()', isNullable: false },
        ],
        foreignKeys: [
          {
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
        indices: [
          { columnNames: ['user_id'] },
          { columnNames: ['category'] },
          { columnNames: ['created_at'] },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('password_entries');
  }
}
```

Run migration:
```bash
npm run typeorm migration:run
```

## Performance Optimization

1. **Indexes**: Critical for query performance
   - `user_id`: For filtering by user (most common query)
   - `category`: For filtering by category
   - `created_at`: For sorting by date

2. **Connection Pooling**: Configure TypeORM pool size
   ```typescript
   new DataSource({
     extra: {
       max: 20,        // Maximum connections
       min: 5,         // Minimum connections
       idleTimeoutMillis: 30000,
     }
   });
   ```

3. **Query Optimization**:
   - Use indexes for WHERE clauses
   - Limit result sets with pagination
   - Monitor slow queries (> 100ms)

4. **Caching** (future enhancement):
   - Cache frequently accessed entries
   - Invalidate on update/delete
   - Use Redis for distributed caching

## Future Enhancements

1. **Additional Endpoints**:
   - GET /api/passwords - List all entries (with pagination)
   - GET /api/passwords/:id - Get specific entry
   - PUT /api/passwords/:id - Update entry
   - DELETE /api/passwords/:id - Delete entry
   - GET /api/passwords/search - Search entries

2. **Features**:
   - Password strength indicator
   - Duplicate detection (same site + username)
   - Bulk operations (import/export)
   - Password history tracking
   - Sharing passwords with other users
   - Password expiration reminders

3. **Security**:
   - Rate limiting on sensitive operations
   - Audit log for all password accesses
   - Two-factor authentication for decrypt
   - Password breach detection (Have I Been Pwned API)

4. **Performance**:
   - Pagination for large result sets
   - Elasticsearch for full-text search
   - Redis caching for frequently accessed entries
   - Background jobs for re-encryption

## Troubleshooting

### Common Issues

1. **"Cannot find module"**: Run `npm install`
2. **TypeORM errors**: Check database connection and migrations
3. **401 Unauthorized**: Verify JWT token and middleware
4. **Encryption errors**: Check PasswordEncryptionService implementation
5. **Validation errors**: Check domain Value Object constraints

### Debug Mode

Enable detailed logging:
```typescript
new DataSource({
  logging: ['query', 'error', 'schema'],
  logger: 'advanced-console',
});
```

## References

- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [TypeORM Documentation](https://typeorm.io/)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
