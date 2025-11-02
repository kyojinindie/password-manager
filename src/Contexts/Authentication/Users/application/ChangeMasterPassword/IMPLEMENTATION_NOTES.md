# Change Master Password - Implementation Notes

## Overview

This implementation provides the **Application Layer** components for the F6: Change Master Password feature following Domain-Driven Design (DDD) and Hexagonal Architecture patterns.

## What's Been Implemented

### ✅ Application Layer Components

1. **MasterPasswordChanger.ts** - The main application service
   - Orchestrates the complete change password workflow
   - Coordinates between Authentication and PasswordVault contexts
   - Manages the complex multi-step operation
   - Pure orchestration - NO business logic

2. **ChangeMasterPasswordRequest.ts** - Input DTO
   - Contains: userId, currentMasterPassword, newMasterPassword
   - Simple interface with primitives only

3. **ChangeMasterPasswordResponse.ts** - Output DTO
   - Returns: userId, passwordEntriesReEncrypted count, changedAt timestamp
   - Provides operation confirmation and metadata

4. **UserNotFoundException.ts** - Domain exception
   - Thrown when user doesn't exist
   - Extends DomainException from Shared context

### ✅ Port Definitions (Interfaces)

5. **PasswordEntryRepository.ts** (in application/ports/)
   - Port for cross-context communication with PasswordVault
   - Methods: findByUserId(), bulkUpdateEncryptedPasswords()
   - Will be implemented by PasswordVault infrastructure

6. **PasswordEncryptionService.ts** (in application/ports/)
   - Port for symmetric encryption/decryption operations
   - Methods: encrypt(), decrypt(), reEncrypt()
   - Will be implemented by infrastructure crypto adapter

## Architecture Decisions

### ✅ Single Responsibility
- MasterPasswordChanger handles ONLY the change password operation
- Follows the pattern: One service = One operation
- Located in dedicated folder: `ChangeMasterPassword/`

### ✅ Proper Orchestration
The service orchestrates but doesn't contain business logic:
- ✅ Converts DTOs to domain objects
- ✅ Delegates validation to domain service (MasterPasswordHashingService)
- ✅ Delegates password verification to User entity
- ✅ Coordinates cross-context operations via ports
- ✅ Manages transaction boundaries (conceptually)
- ✅ Returns DTOs, not domain objects

### ✅ Dependency Injection
All dependencies injected via constructor:
- UserRepository (existing)
- PasswordEntryRepository (port - needs implementation)
- MasterPasswordHashingService (existing)
- PasswordEncryptionService (port - needs implementation)

### ✅ Error Handling
Domain exceptions propagate naturally:
- InvalidCredentialsException (wrong current password)
- UserNotFoundException (user doesn't exist)
- Error (password complexity validation failed)
- Error (re-encryption failed)

## What Still Needs to Be Done

### 🔴 CRITICAL: Domain Layer Changes Required

**Problem:** The User entity has readonly fields for masterPasswordHash and salt, making it immutable. We need to add a proper domain method to change the password.

**Solution Required:**

Add this method to `/home/alegra/erick-projects/pasword-manager/src/Contexts/Authentication/Users/domain/User.ts`:

```typescript
/**
 * Change the user's master password
 *
 * Business rules:
 * - User must be active
 * - New password hash and salt must be provided
 * - This is a critical security operation
 *
 * @param newMasterPasswordHash - The new hashed password
 * @param newSalt - The new salt value
 */
public changeMasterPassword(
  newMasterPasswordHash: MasterPasswordHash,
  newSalt: Salt
): void {
  this.ensureIsActive();

  // Update the password hash and salt
  // Note: This requires making these fields mutable (remove readonly)
  // Or: Use a different pattern (e.g., return new User instance)
  (this._masterPasswordHash as any) = newMasterPasswordHash;
  (this._salt as any) = newSalt;

  // Optional: Record domain event
  // this.record(new MasterPasswordChangedEvent(this._id));
}
```

**Alternative (Recommended):** Make masterPasswordHash and salt mutable by removing `readonly` keyword, since passwords CAN change over time.

### 🟡 Infrastructure Layer - Adapters Needed

1. **PasswordEncryptionService Implementation**
   - Create: `src/Contexts/Authentication/Users/infrastructure/services/CryptoPasswordEncryptionService.ts`
   - Use Node.js crypto module (AES-256-GCM recommended)
   - Implement key derivation from master password (PBKDF2 or Argon2)
   - Implement encrypt(), decrypt(), reEncrypt() methods

2. **PasswordEntryRepository Implementation**
   - This belongs to PasswordVault context (when it exists)
   - Or: Create adapter in Authentication context that delegates to PasswordVault
   - Must implement findByUserId() and bulkUpdateEncryptedPasswords()

3. **Transaction Management**
   - Implement UnitOfWork or Transaction pattern
   - Ensure atomicity: user update + password entries update
   - Options:
     - Database transactions (if using SQL)
     - Two-phase commit
     - Saga pattern
     - Event sourcing

### 🟡 PasswordVault Context (May Not Exist Yet)

If PasswordVault context doesn't exist, you'll need to:

1. Create the bounded context structure:
   ```
   src/Contexts/PasswordVault/
   ├── PasswordEntries/
   │   ├── domain/
   │   │   ├── PasswordEntry.ts (aggregate root)
   │   │   ├── PasswordEntryId.ts
   │   │   ├── EncryptedPassword.ts (value object)
   │   │   └── PasswordEntryRepository.ts
   │   ├── application/
   │   └── infrastructure/
   ```

2. Implement the PasswordEntryRepository adapter that implements the port

3. Consider how PasswordVault and Authentication contexts communicate:
   - Shared Kernel (ports/DTOs)
   - Domain Events
   - Anti-Corruption Layer

### 🟢 Controller Layer (Entry Point)

Create HTTP controller:
- Location: `src/apps/backend/controllers/ChangeMasterPasswordController.ts`
- Handle HTTP request
- Validate input
- Call MasterPasswordChanger.run()
- Return HTTP response
- Map exceptions to HTTP status codes

### 🟢 Testing

1. **Unit Tests** (Application Layer)
   - Test MasterPasswordChanger with mocked dependencies
   - Test orchestration flow
   - Test error handling
   - Location: `tests/Contexts/Authentication/Users/application/ChangeMasterPassword/`

2. **Integration Tests**
   - Test with real repositories (in-memory or test database)
   - Test transaction boundaries
   - Test cross-context coordination

3. **Domain Tests**
   - Test User.changeMasterPassword() method (once added)
   - Test password verification

## Usage Example

```typescript
// In your controller or CLI handler
const masterPasswordChanger = new MasterPasswordChanger(
  userRepository,           // Existing TypeORM repository
  passwordEntryRepository,  // Needs implementation
  hashingService,           // Existing service
  encryptionService        // Needs implementation
);

try {
  const response = await masterPasswordChanger.run({
    userId: "550e8400-e29b-41d4-a716-446655440000",
    currentMasterPassword: "OldP@ssw0rd123!",
    newMasterPassword: "NewP@ssw0rd456!"
  });

  console.log(`Master password changed successfully!`);
  console.log(`Re-encrypted ${response.passwordEntriesReEncrypted} password entries`);
  console.log(`Changed at: ${response.changedAt}`);
} catch (error) {
  if (error instanceof InvalidCredentialsException) {
    console.error("Current password is incorrect");
  } else if (error instanceof UserNotFoundException) {
    console.error("User not found");
  } else {
    console.error("Error changing password:", error.message);
  }
}
```

## Transaction Safety Considerations

The current implementation outlines transaction boundaries but doesn't enforce them. In production, you MUST ensure atomicity:

**Problem:** If user.save() succeeds but passwordEntries.bulkUpdate() fails, the user has a new password hash but the password entries are still encrypted with the old password (DATA LOSS!).

**Solutions:**

1. **Database Transaction** (Recommended for SQL databases):
   ```typescript
   await transactionManager.run(async () => {
     await userRepository.save(updatedUser);
     await passwordEntryRepository.bulkUpdateEncryptedPasswords(reEncryptedEntries);
   });
   ```

2. **Two-Phase Commit**: Prepare both operations, then commit both
3. **Saga Pattern**: Implement compensation logic if second operation fails
4. **Event Sourcing**: Store events and rebuild state

## Security Considerations

1. **Rate Limiting**: Prevent brute force attempts on current password
2. **Audit Logging**: Log all password change attempts (success and failure)
3. **Session Invalidation**: Consider invalidating all sessions after password change
4. **Token Blacklisting**: Invalidate all refresh tokens after password change
5. **Email Notification**: Notify user via email about password change
6. **Backup Encryption**: Consider keeping encrypted backup before re-encrypting

## Performance Considerations

1. **Bulk Re-encryption**: Can be slow with many password entries
   - Consider async job queue for large numbers
   - Show progress indicator to user
   - Implement timeout handling

2. **Parallel vs Sequential**:
   - Current implementation: Parallel (Promise.all)
   - Pro: Faster for many entries
   - Con: Higher memory usage
   - Alternative: Sequential processing for memory efficiency

## Cross-Context Communication

This use case demonstrates cross-context coordination between:
- **Authentication Context**: Manages Users and authentication
- **PasswordVault Context**: Manages PasswordEntries

The PasswordEntryRepository port acts as an Anti-Corruption Layer (ACL), protecting the Authentication context from changes in PasswordVault.

## Next Steps

1. ⚠️ Modify User entity to support password changes (critical)
2. Implement PasswordEncryptionService infrastructure adapter
3. Implement PasswordEntryRepository (or create PasswordVault context)
4. Implement transaction management
5. Create HTTP controller
6. Add comprehensive tests
7. Consider additional security measures (session invalidation, notifications)

## Files Created

All files use absolute paths for reference:

1. `/home/alegra/erick-projects/pasword-manager/src/Contexts/Authentication/Users/application/ChangeMasterPassword/MasterPasswordChanger.ts`
2. `/home/alegra/erick-projects/pasword-manager/src/Contexts/Authentication/Users/application/ChangeMasterPassword/ChangeMasterPasswordRequest.ts`
3. `/home/alegra/erick-projects/pasword-manager/src/Contexts/Authentication/Users/application/ChangeMasterPassword/ChangeMasterPasswordResponse.ts`
4. `/home/alegra/erick-projects/pasword-manager/src/Contexts/Authentication/Users/application/ChangeMasterPassword/index.ts`
5. `/home/alegra/erick-projects/pasword-manager/src/Contexts/Authentication/Users/application/ports/PasswordEntryRepository.ts`
6. `/home/alegra/erick-projects/pasword-manager/src/Contexts/Authentication/Users/application/ports/PasswordEncryptionService.ts`
7. `/home/alegra/erick-projects/pasword-manager/src/Contexts/Authentication/Users/domain/UserNotFoundException.ts`

## Compliance with CLAUDE.md Standards

✅ **DDD Principles**
- Application layer contains only orchestration
- Business logic delegated to domain
- Proper use of Value Objects and Entities
- Domain exceptions used

✅ **Hexagonal Architecture**
- Ports defined as interfaces in application layer
- Infrastructure dependencies injected
- Direction of dependencies: Infrastructure → Application → Domain

✅ **Bounded Contexts**
- Clear separation between Authentication and PasswordVault
- Anti-Corruption Layer (port) for cross-context communication

✅ **Operation-Based Organization**
- Located in ChangeMasterPassword/ folder
- Single responsibility per service

✅ **TypeScript Standards**
- Strong typing throughout
- No 'any' types (except temporary workaround in User instantiation)
- Clear interfaces
- Comprehensive comments

✅ **Testing Readiness**
- All dependencies are interfaces (easily mockable)
- Pure orchestration (testable without infrastructure)
- Clear separation of concerns
