# Change Master Password - Use Case

## Overview

This directory contains the **Application Layer** implementation for the F6: Change Master Password feature, following Domain-Driven Design (DDD) and Hexagonal Architecture principles.

## Files in This Directory

### Application Service
- **MasterPasswordChanger.ts** - The main orchestrator for the change password operation
  - Single responsibility: coordinates the master password change workflow
  - Pure orchestration, no business logic
  - Manages transaction boundaries conceptually

### DTOs (Data Transfer Objects)
- **ChangeMasterPasswordRequest.ts** - Input DTO with userId, current password, and new password
- **ChangeMasterPasswordResponse.ts** - Output DTO with operation confirmation and metadata
- Simple interfaces with primitives only

### Documentation
- **IMPLEMENTATION_NOTES.md** - Detailed implementation guide and next steps
- **ARCHITECTURE.md** - Architecture diagrams and design patterns explanation
- **README.md** - This file

### Exports
- **index.ts** - Clean exports for easy importing

## Related Files (Other Directories)

### Ports (Interfaces)
Located in: `/home/alegra/erick-projects/pasword-manager/src/Contexts/Authentication/Users/application/ports/`

- **PasswordEntryRepository.ts** - Port for cross-context communication with PasswordVault
- **PasswordEncryptionService.ts** - Port for encryption/decryption operations

### Domain Layer
Located in: `/home/alegra/erick-projects/pasword-manager/src/Contexts/Authentication/Users/domain/`

- **UserNotFoundException.ts** - New domain exception (created)
- **User.ts** - Needs `changeMasterPassword()` method (to be added)
- **UserRepository.ts** - Existing repository interface
- **MasterPasswordHashingService.ts** - Existing domain service

## Quick Start

### Using the Service

```typescript
import { MasterPasswordChanger } from './application/ChangeMasterPassword';

// Inject dependencies (repositories and services)
const service = new MasterPasswordChanger(
  userRepository,
  passwordEntryRepository,
  hashingService,
  encryptionService
);

// Execute the operation
const response = await service.run({
  userId: "550e8400-e29b-41d4-a716-446655440000",
  currentMasterPassword: "OldP@ssw0rd123!",
  newMasterPassword: "NewP@ssw0rd456!"
});

console.log(`Re-encrypted ${response.passwordEntriesReEncrypted} entries`);
```

## What's Complete

✅ Application Service with full orchestration logic
✅ Request and Response DTOs
✅ Port definitions (interfaces)
✅ Domain exception (UserNotFoundException)
✅ Comprehensive documentation
✅ Architecture diagrams

## What's Needed Next

❌ Domain Layer: Add `User.changeMasterPassword()` method
❌ Infrastructure: Implement `PasswordEncryptionService` adapter
❌ Infrastructure: Implement `PasswordEntryRepository` adapter (or create PasswordVault context)
❌ Infrastructure: Implement transaction management (UnitOfWork pattern)
❌ Infrastructure: Create HTTP controller
❌ Tests: Unit tests for MasterPasswordChanger
❌ Tests: Integration tests with real repositories

## Critical Notes

1. **Transaction Safety**: The current implementation outlines transaction boundaries but doesn't enforce them. You MUST implement proper transaction management before deploying to production.

2. **Domain Modification Required**: The User entity needs to support password changes. The `masterPasswordHash` and `salt` fields are currently readonly.

3. **Cross-Context Coordination**: This use case demonstrates coordination between Authentication and PasswordVault contexts through the Anti-Corruption Layer pattern.

## Architecture Compliance

This implementation follows all principles from CLAUDE.md:

- ✅ DDD: Orchestration only, business logic in domain
- ✅ Hexagonal: Ports defined, infrastructure injected
- ✅ Single Responsibility: One service, one operation
- ✅ Operation-Based Structure: Located in ChangeMasterPassword/ folder
- ✅ Strong Typing: No `any` types (except temporary workaround)
- ✅ Dependency Injection: All dependencies via constructor

## Documentation

For detailed information, see:

1. **IMPLEMENTATION_NOTES.md** - Step-by-step implementation guide, what's done, what's needed
2. **ARCHITECTURE.md** - Visual diagrams, data flow, security architecture, bounded context mapping

## Questions?

This implementation was designed by the Application Expert agent following strict DDD and Hexagonal Architecture principles. All design decisions are documented in the ARCHITECTURE.md and IMPLEMENTATION_NOTES.md files.
