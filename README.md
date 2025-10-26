# Password Manager

A secure password manager built with TypeScript following Domain-Driven Design (DDD) and Hexagonal Architecture principles.

## 📋 Features

- Secure password storage with AES-256-GCM encryption
- Master password authentication
- Password generation
- Categories and tags for organization
- Built with DDD and Hexagonal Architecture
- Test-Driven Development (TDD)
- 100% TypeScript

## 🏗️ Architecture

This project follows:

- **Domain-Driven Design (DDD)**: Rich domain models, ubiquitous language, bounded contexts
- **Hexagonal Architecture**: Separation of concerns, ports and adapters pattern
- **Test-Driven Development (TDD)**: Tests first approach with Mother Object pattern

### Project Structure

```
src/
├── Contexts/                    # Bounded Contexts
│   ├── Shared/                  # Shared Kernel
│   │   ├── domain/              # Base classes (AggregateRoot, ValueObject, etc.)
│   │   └── infrastructure/      # Shared infrastructure
│   │
│   ├── Authentication/          # Authentication Context
│   │   └── Users/
│   │       ├── domain/          # User domain model
│   │       ├── application/     # Use cases
│   │       └── infrastructure/  # Adapters (DB, HTTP, etc.)
│   │
│   └── PasswordVault/           # Password Vault Context
│       └── Passwords/
│           ├── domain/
│           ├── application/
│           └── infrastructure/
│
├── apps/                        # Application entry points
│   ├── api/                     # REST API
│   └── cli/                     # CLI (optional)
│
tests/
├── Contexts/                    # Tests mirror src structure
└── mothers/                     # Mother Objects for testing
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.x
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd password-manager
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```bash
# Edit .env file with your preferred editor
nano .env
```

### Development

Run the development server:
```bash
npm run dev
```

### Building

Build the project:
```bash
npm run build
```

### Testing

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run tests with coverage:
```bash
npm run test:coverage
```

### Code Quality

Check TypeScript types:
```bash
npm run typecheck
```

Lint code:
```bash
npm run lint
```

Fix linting issues:
```bash
npm run lint:fix
```

Format code:
```bash
npm run format
```

Check formatting:
```bash
npm run format:check
```

## 📚 Documentation

- [CLAUDE.md](./CLAUDE.md) - Complete coding rules and architecture guidelines
- [FEATURES.md](./FEATURES.md) - Atomic features breakdown
- [PASSWORD_MANAGER_DESIGN.md](./PASSWORD_MANAGER_DESIGN.md) - Design documentation

## 🧪 Testing Strategy

This project uses TDD with the Mother Object pattern:

1. Write tests first (Red)
2. Implement minimum code to pass (Green)
3. Refactor (Refactor)

Mother Objects are used for creating test data consistently. See `tests/mothers/` directory.

## 📝 Development Workflow

1. Create tests for the feature
2. Implement domain model (entities, value objects)
3. Implement application layer (use cases)
4. Implement infrastructure layer (adapters)
5. Ensure all tests pass
6. Run linting and formatting

## 🔒 Security

- Master passwords are hashed with bcrypt (factor 12)
- Passwords are encrypted with AES-256-GCM
- JWT tokens for session management
- No sensitive data in logs

## 📄 License

MIT

## 👥 Contributing

Please read the coding guidelines in [CLAUDE.md](./CLAUDE.md) before contributing.

## 🗺️ Roadmap

See [FEATURES.md](./FEATURES.md) for the complete roadmap of atomic features.

### Current Phase: F0 - Setup Proyecto ✅

Next phases:
- F1: Shared Kernel
- F2: Register User
- F3: Login User
- ...

---

**Built with TypeScript, DDD, and Hexagonal Architecture** 🏛️
