# Infrastructure Layer - Authentication/Users

This directory contains all infrastructure adapters for the Authentication/Users bounded context, following **Hexagonal Architecture** principles.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Infrastructure Layer                      │
│  (Adapters - Bridges between external world and domain)     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  PRIMARY ADAPTERS (Input/Driving)                           │
│  ┌────────────────────────────────────────────────┐        │
│  │  controllers/                                   │        │
│  │  - LoginUserController.ts                      │        │
│  │    → Handles HTTP requests                     │        │
│  │    → Delegates to Application Layer            │        │
│  │    → Maps errors to HTTP status codes          │        │
│  └────────────────────────────────────────────────┘        │
│                          ↓                                   │
│                 [Application Layer]                          │
│                          ↑                                   │
│  SECONDARY ADAPTERS (Output/Driven)                         │
│  ┌────────────────────────────────────────────────┐        │
│  │  JwtTokenGenerationService.ts                  │        │
│  │  - Implements TokenGenerationService port      │        │
│  │  - Generates JWT access/refresh tokens         │        │
│  │  - Hides jsonwebtoken implementation           │        │
│  └────────────────────────────────────────────────┘        │
│                                                              │
│  DEPENDENCY INJECTION                                        │
│  ┌────────────────────────────────────────────────┐        │
│  │  dependencies.ts                                │        │
│  │  - Wires all dependencies                      │        │
│  │  - Factory functions for components            │        │
│  │  - Configuration management                    │        │
│  └────────────────────────────────────────────────┘        │
│                                                              │
│  ROUTING                                                     │
│  ┌────────────────────────────────────────────────┐        │
│  │  routes/auth.routes.ts                         │        │
│  │  - Express.js route definitions                │        │
│  │  - Maps HTTP endpoints to controllers          │        │
│  └────────────────────────────────────────────────┘        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Components

### Primary Adapters (Controllers)

**Location:** `controllers/`

Controllers are **thin adapters** that:
- ✅ Handle HTTP protocol concerns (request/response format)
- ✅ Validate request format (not business rules)
- ✅ Delegate to application services
- ✅ Map domain exceptions to HTTP status codes
- ❌ **NO** business logic
- ❌ **NO** direct database access

**Example:**
```typescript
import { LoginUserController } from './controllers/LoginUserController';

// Controller receives use case as dependency
const controller = new LoginUserController(userLoginUseCase);

// Handle HTTP request
app.post('/auth/login', (req, res) => controller.run(req, res));
```

### Secondary Adapters (Services)

**Files:** `JwtTokenGenerationService.ts`

Secondary adapters implement **domain ports** (interfaces):
- ✅ Implement domain-defined interfaces
- ✅ Encapsulate external libraries (JWT, databases, etc.)
- ✅ Translate between domain and external representations
- ❌ **NO** business logic
- ❌ **NO** exposure of implementation details to domain

**Example:**
```typescript
import { JwtTokenGenerationService } from './JwtTokenGenerationService';

// Create service with configuration
const tokenService = new JwtTokenGenerationService(process.env.JWT_SECRET);

// Use in application layer
const accessToken = await tokenService.generateAccessToken(userId);
```

### Dependency Injection

**File:** `dependencies.ts`

Factory functions that wire all dependencies:

```typescript
import { createLoginUserController } from './dependencies';
import { TypeOrmUserRepository } from './persistence/TypeOrmUserRepository';

// Create repository (when implemented)
const userRepository = new TypeOrmUserRepository(dataSource);

// Create fully configured controller with ALL dependencies
const loginController = createLoginUserController(userRepository);
```

**Benefits:**
- Easy to test (inject mocks)
- Easy to swap implementations
- Centralized configuration
- Clear dependency graph

### Routes

**File:** `routes/auth.routes.ts`

Express.js route configuration:

```typescript
import { createAuthRoutes } from './routes/auth.routes';

// Create routes with controllers
const authRoutes = createAuthRoutes(loginController);

// Mount routes
app.use('/auth', authRoutes);
```

## Setup Instructions

### 1. Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

**Required variables:**
- `JWT_SECRET`: Must be at least 32 characters (cryptographically secure)
- `PORT`: Application port (default: 3000)
- `NODE_ENV`: development/production

### 2. Install Dependencies

Already installed via `package.json`:
- `express`: HTTP server
- `jsonwebtoken`: JWT token generation
- `bcrypt`: Password hashing
- `dotenv`: Environment configuration

### 3. Wire Dependencies in Your App

```typescript
// src/apps/api/server.ts (example)
import 'dotenv/config';
import express from 'express';
import { createLoginUserController } from './Contexts/Authentication/Users/infrastructure/dependencies';
import { createAuthRoutes } from './Contexts/Authentication/Users/infrastructure/routes/auth.routes';

// Create Express app
const app = express();
app.use(express.json());

// Create repository (you need to implement this - see persistence/ directory)
// const userRepository = new TypeOrmUserRepository(dataSource);
// For now, you can use InMemoryUserRepository for testing

// Create controller with dependencies
const loginController = createLoginUserController(userRepository);

// Setup routes
const authRoutes = createAuthRoutes(loginController);
app.use('/auth', authRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## API Endpoints

### POST /auth/login

Login a user with email and master password.

**Request:**
```json
{
  "email": "user@example.com",
  "masterPassword": "SecurePassword123!"
}
```

**Success Response (200 OK):**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Bad Request | Missing or invalid request fields |
| 401 | Unauthorized | Invalid email or password |
| 403 | Forbidden | User account is inactive |
| 423 | Locked | Account locked due to failed login attempts |
| 500 | Internal Server Error | Unexpected error |

## Testing

### Unit Testing Controllers

```typescript
import { LoginUserController } from './controllers/LoginUserController';
import { UserLogin } from '../application/Login/UserLogin';

describe('LoginUserController', () => {
  it('should return 200 with tokens on successful login', async () => {
    // Mock use case
    const mockUserLogin = {
      run: jest.fn().mockResolvedValue({
        userId: 'test-id',
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 900,
      }),
    } as unknown as UserLogin;

    // Create controller with mock
    const controller = new LoginUserController(mockUserLogin);

    // Mock Express request/response
    const req = {
      body: {
        email: 'test@example.com',
        masterPassword: 'Password123!',
      },
    } as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    // Execute
    await controller.run(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      userId: 'test-id',
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      expiresIn: 900,
    });
  });
});
```

### Integration Testing

```typescript
import { createUserLoginUseCase } from './dependencies';
import { InMemoryUserRepository } from '../../../tests/.../InMemoryUserRepository';

describe('Login Integration', () => {
  it('should login user successfully', async () => {
    // Setup
    const userRepository = new InMemoryUserRepository();
    const userLogin = createUserLoginUseCase(userRepository);

    // Add test user
    await userRepository.save(testUser);

    // Execute
    const result = await userLogin.run({
      email: 'test@example.com',
      masterPassword: 'Password123!',
    });

    // Assert
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
  });
});
```

## Architecture Principles Checklist

When adding new infrastructure components, ensure:

- [ ] **Dependency Direction**: Infrastructure → Application → Domain
- [ ] **No Business Logic**: All business logic is in Domain/Application
- [ ] **Thin Adapters**: Controllers/Services only translate, don't transform
- [ ] **Port Implementation**: Secondary adapters implement domain interfaces
- [ ] **Error Translation**: Map domain exceptions to protocol-specific errors
- [ ] **Configuration**: External configuration (env vars, not hardcoded)
- [ ] **Testability**: Easy to mock/stub for testing
- [ ] **Documentation**: Clear comments explaining architecture decisions

## Next Steps

1. **Implement User Repository**: Create TypeOrmUserRepository or MongoUserRepository
2. **Add Middleware**: Authentication middleware for protected routes
3. **Add Logging**: Structured logging for requests/errors
4. **Add Monitoring**: Metrics and health checks
5. **Add Refresh Token Endpoint**: Implement token refresh logic

## Common Pitfalls to Avoid

❌ **Don't put business logic in controllers**
```typescript
// BAD
async run(req, res) {
  if (failedAttempts > 5) { // Business rule in controller!
    return res.status(423).json(...);
  }
}

// GOOD
async run(req, res) {
  try {
    await this.userLogin.run(request); // Domain handles business rules
  } catch (error) {
    // Only map errors to HTTP
  }
}
```

❌ **Don't expose implementation details**
```typescript
// BAD - Exposes JWT library
interface TokenService {
  sign(payload: any, options: jwt.SignOptions): string;
}

// GOOD - Domain-centric interface
interface TokenGenerationService {
  generateAccessToken(userId: UserId): Promise<AccessToken>;
}
```

❌ **Don't hardcode configuration**
```typescript
// BAD
const token = jwt.sign(payload, 'hardcoded-secret');

// GOOD
const token = jwt.sign(payload, this.secret); // Injected from env
```

## Questions?

See the main project documentation in `/CLAUDE.md` for:
- Overall system architecture
- Domain-Driven Design principles
- Testing strategies
- Code quality standards
