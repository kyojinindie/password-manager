# Change Master Password - Architecture Overview

## Hexagonal Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          INFRASTRUCTURE LAYER                                │
│                        (Adapters - To Be Implemented)                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────────────────┐         ┌───────────────────────────────────┐    │
│  │ HTTP Controller      │         │  Crypto Adapter                   │    │
│  │ (Primary Adapter)    │         │  implements                       │    │
│  │                      │         │  PasswordEncryptionService        │    │
│  │ - Receives HTTP      │         │                                   │    │
│  │ - Validates input    │         │  - Uses Node.js crypto            │    │
│  │ - Calls Application  │         │  - AES-256-GCM encryption         │    │
│  │ - Returns response   │         │  - PBKDF2 key derivation          │    │
│  └──────────┬───────────┘         └─────────────┬─────────────────────┘    │
│             │                                    │                           │
│             │ calls                              │ implements                │
│             ▼                                    ▼                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                           APPLICATION LAYER                                  │
│                        (Use Case Orchestration)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│                   ┌───────────────────────────────────┐                     │
│                   │   MasterPasswordChanger           │                     │
│                   │   (Application Service)           │                     │
│                   │                                   │                     │
│                   │   Orchestrates:                   │                     │
│                   │   1. Verify user exists           │                     │
│                   │   2. Verify current password      │                     │
│                   │   3. Validate new password        │                     │
│                   │   4. Re-encrypt all entries       │                     │
│                   │   5. Update user password         │                     │
│                   │   6. Save everything              │                     │
│                   └───────────────┬───────────────────┘                     │
│                                   │                                          │
│                                   │ uses ports                               │
│                                   ▼                                          │
│     ┌──────────────────────────────────────────────────────────────┐       │
│     │                    Application Ports                          │       │
│     │                     (Interfaces)                              │       │
│     ├──────────────────────────────────────────────────────────────┤       │
│     │                                                                │       │
│     │  PasswordEntryRepository          PasswordEncryptionService   │       │
│     │  - findByUserId()                 - encrypt()                 │       │
│     │  - bulkUpdateEncryptedPasswords() - decrypt()                 │       │
│     │                                    - reEncrypt()               │       │
│     │                                                                │       │
│     └──────────────────────────────────────────────────────────────┘       │
│                                   │                                          │
│                                   │ delegates to                             │
│                                   ▼                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                             DOMAIN LAYER                                     │
│                         (Business Logic)                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │  User Aggregate Root                                                │    │
│  │                                                                      │    │
│  │  Properties:                         Methods:                       │    │
│  │  - UserId                           - verifyPassword()              │    │
│  │  - Email                            - changeMasterPassword()        │    │
│  │  - Username                         - ensureCanLogin()              │    │
│  │  - MasterPasswordHash               - recordSuccessfulLogin()       │    │
│  │  - Salt                                                             │    │
│  │  - IsActive                                                         │    │
│  │  - FailedLoginAttempts                                             │    │
│  │                                                                      │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                               │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │  Domain Services                                                    │    │
│  │                                                                      │    │
│  │  MasterPasswordHashingService                                      │    │
│  │  - hash()                                                           │    │
│  │  - verify()                                                         │    │
│  │  - validatePasswordComplexity()                                    │    │
│  │  - generateSalt()                                                   │    │
│  │                                                                      │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                               │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │  Domain Exceptions                                                  │    │
│  │                                                                      │    │
│  │  - InvalidCredentialsException                                     │    │
│  │  - UserNotFoundException                                           │    │
│  │  - AccountLockedException                                          │    │
│  │  - InactiveUserException                                           │    │
│  │                                                                      │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow - Change Master Password

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                               │
│                              REQUEST FLOW                                    │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘

User Request (HTTP POST)
    │
    │  {
    │    userId: "uuid",
    │    currentMasterPassword: "Old123!",
    │    newMasterPassword: "New456!"
    │  }
    │
    ▼
┌──────────────────────────┐
│  HTTP Controller         │  ← Infrastructure Layer
│  (Primary Adapter)       │
└────────────┬─────────────┘
             │
             │ ChangeMasterPasswordRequest DTO
             │
             ▼
┌──────────────────────────────────────────────────────────┐
│  MasterPasswordChanger.run()                             │  ← Application Layer
│  (Application Service)                                   │
└────────────┬─────────────────────────────────────────────┘
             │
             │ Step 1: Find User
             ├─────────────────────────────────────┐
             │                                     │
             ▼                                     ▼
       UserRepository                        UserId VO
       .findById()                          (domain object)
             │
             │ Returns: User aggregate
             │
             │ Step 2: Verify Current Password
             ├─────────────────────────────────────┐
             │                                     │
             ▼                                     ▼
       User.verifyPassword()              MasterPasswordHashingService
       (domain method)                    .verify()
             │
             │ Returns: boolean (true/false)
             │
             │ Step 3: Validate New Password
             ├─────────────────────────────────────┐
             │                                     │
             ▼                                     ▼
       MasterPasswordHashingService
       .validatePasswordComplexity()
       (throws if invalid)
             │
             │ Step 4: Find All Password Entries
             ├─────────────────────────────────────┐
             │                                     │
             ▼                                     ▼
       PasswordEntryRepository          Returns: PasswordEntryData[]
       .findByUserId()                  [
                                          {id: "1", encryptedPassword: "..."},
                                          {id: "2", encryptedPassword: "..."}
                                        ]
             │
             │ Step 5: Re-encrypt All Entries (Parallel)
             ├─────────────────────────────────────┐
             │                                     │
             ▼                                     ▼
       PasswordEncryptionService
       .reEncrypt() × N entries
       (for each password entry)
             │
             │ Returns: Re-encrypted entries
             │
             │ Step 6: Hash New Password
             ├─────────────────────────────────────┐
             │                                     │
             ▼                                     ▼
       MasterPasswordHashingService        Returns: hash + salt
       .hash() + .generateSalt()           MasterPasswordHash VO + Salt VO
             │
             │ Step 7: Update User Password
             ├─────────────────────────────────────┐
             │                                     │
             ▼                                     ▼
       User.changeMasterPassword()         (domain method)
       (newHash, newSalt)                  Updates user state
             │
             │ Step 8: TRANSACTION - Save User
             ├─────────────────────────────────────┐
             │                                     │
             ▼                                     ▼
       UserRepository.save()               Persists to database
             │
             │ Step 9: TRANSACTION - Save Password Entries
             ├─────────────────────────────────────┐
             │                                     │
             ▼                                     ▼
       PasswordEntryRepository             Bulk update in database
       .bulkUpdateEncryptedPasswords()
             │
             │ Returns: ChangeMasterPasswordResponse DTO
             │
             ▼
       {
         userId: "uuid",
         passwordEntriesReEncrypted: 15,
         changedAt: "2025-11-02T..."
       }
             │
             ▼
┌──────────────────────────┐
│  HTTP Controller         │  ← Infrastructure Layer
│  Returns HTTP 200 + JSON │
└──────────────────────────┘
             │
             ▼
       User receives success response
```

## Cross-Context Communication

```
┌──────────────────────────────┐         ┌─────────────────────────────────┐
│  Authentication Context      │         │  PasswordVault Context          │
│                              │         │                                 │
│  ┌────────────────────────┐ │         │  ┌───────────────────────────┐ │
│  │  User Aggregate        │ │         │  │  PasswordEntry Aggregate  │ │
│  │                        │ │         │  │                           │ │
│  │  - id                  │ │         │  │  - id                     │ │
│  │  - email               │ │         │  │  - userId (FK)            │ │
│  │  - masterPasswordHash  │ │         │  │  - encryptedPassword      │ │
│  │  - salt                │ │         │  │  - website                │ │
│  │                        │ │         │  │  - username               │ │
│  └────────────────────────┘ │         │  │                           │ │
│                              │         │  └───────────────────────────┘ │
│  ┌────────────────────────┐ │         │                                 │
│  │  Application Layer     │ │         │  ┌───────────────────────────┐ │
│  │                        │ │         │  │  Infrastructure           │ │
│  │  MasterPasswordChanger │ │         │  │                           │ │
│  │         │              │ │         │  │  Implements:              │ │
│  │         │              │ │         │  │  PasswordEntryRepository  │ │
│  │         └──────────────┼─┼─────────┼─▶│  (Port defined in Auth)   │ │
│  │                        │ │  uses   │  │                           │ │
│  │  Defines Port:         │ │  port   │  │  - findByUserId()         │ │
│  │  PasswordEntryRepo     │ │         │  │  - bulkUpdate...()        │ │
│  │                        │ │         │  │                           │ │
│  └────────────────────────┘ │         │  └───────────────────────────┘ │
│                              │         │                                 │
└──────────────────────────────┘         └─────────────────────────────────┘
        Context A                                  Context B
    (owns the port)                          (implements the port)

        ↑                                            ↑
        │                                            │
        └────────────── Anti-Corruption Layer ──────┘
                      (Port/Interface acts as ACL)
```

## Transaction Boundaries

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      TRANSACTION BOUNDARY                                │
│                                                                           │
│  BEGIN TRANSACTION                                                       │
│                                                                           │
│    ┌──────────────────────────────────────────────────────────────┐    │
│    │  Step 1: Update User Password Hash                           │    │
│    │                                                               │    │
│    │  UPDATE users                                                │    │
│    │  SET master_password_hash = ?, salt = ?                      │    │
│    │  WHERE id = ?                                                │    │
│    │                                                               │    │
│    └──────────────────────────────────────────────────────────────┘    │
│                              │                                           │
│                              │ SUCCESS                                   │
│                              ▼                                           │
│    ┌──────────────────────────────────────────────────────────────┐    │
│    │  Step 2: Bulk Update Password Entries                        │    │
│    │                                                               │    │
│    │  UPDATE password_entries                                     │    │
│    │  SET encrypted_password = ?                                  │    │
│    │  WHERE id IN (?, ?, ?, ...)                                  │    │
│    │                                                               │    │
│    └──────────────────────────────────────────────────────────────┘    │
│                              │                                           │
│                              │ SUCCESS                                   │
│                              ▼                                           │
│  COMMIT TRANSACTION                                                      │
│                                                                           │
│  ✅ Both operations succeeded - data is consistent                       │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                      ERROR SCENARIO                                      │
│                                                                           │
│  BEGIN TRANSACTION                                                       │
│                                                                           │
│    Step 1: Update User Password Hash → ✅ SUCCESS                        │
│    Step 2: Bulk Update Password Entries → ❌ FAILED                      │
│                                                                           │
│  ROLLBACK TRANSACTION                                                    │
│                                                                           │
│  ⚠️  User password NOT changed - data remains consistent                 │
│  ⚠️  Password entries still encrypted with old password                  │
│  ⚠️  User can still log in with old password                             │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

## Dependency Graph

```
MasterPasswordChanger (Application Service)
    │
    ├─ depends on → UserRepository (Port)
    │                   │
    │                   └─ defined in → Domain Layer
    │                         │
    │                         └─ implemented by → TypeORM Adapter (Infrastructure)
    │
    ├─ depends on → PasswordEntryRepository (Port)
    │                   │
    │                   └─ defined in → Application Layer (ports/)
    │                         │
    │                         └─ implemented by → PasswordVault Adapter (Infrastructure)
    │
    ├─ depends on → MasterPasswordHashingService (Domain Service)
    │                   │
    │                   └─ implemented in → Domain Layer
    │                         │
    │                         └─ uses → bcrypt library
    │
    └─ depends on → PasswordEncryptionService (Port)
                        │
                        └─ defined in → Application Layer (ports/)
                              │
                              └─ implemented by → Crypto Adapter (Infrastructure)
                                    │
                                    └─ uses → Node.js crypto module

Legend:
  Port = Interface (abstract contract)
  Service = Concrete implementation
  → = "depends on" or "is implemented by"
```

## Key Design Patterns Used

1. **Hexagonal Architecture (Ports & Adapters)**
   - Ports: PasswordEntryRepository, PasswordEncryptionService
   - Adapters: Will be implemented in infrastructure layer

2. **Application Service Pattern**
   - MasterPasswordChanger orchestrates the use case
   - No business logic, only coordination

3. **Repository Pattern**
   - UserRepository, PasswordEntryRepository
   - Abstract data persistence

4. **Domain Service Pattern**
   - MasterPasswordHashingService
   - Encapsulates domain logic that doesn't belong to a single entity

5. **Value Object Pattern**
   - UserId, Email, MasterPasswordHash, Salt
   - Immutable, validated on construction

6. **Anti-Corruption Layer (ACL)**
   - PasswordEntryRepository port protects Authentication context
   - Prevents coupling between bounded contexts

7. **DTO Pattern**
   - ChangeMasterPasswordRequest, ChangeMasterPasswordResponse
   - Simple data transfer, no behavior

8. **Unit of Work / Transaction Pattern**
   - Conceptually defined (needs implementation)
   - Ensures atomicity across multiple aggregates

## Security Architecture

```
Master Password Flow:

  User's Master Password (Plain Text)
         │
         │ Used for TWO purposes:
         │
         ├─────────────────────────────┬────────────────────────────┐
         │                             │                            │
         ▼                             ▼                            ▼
   Authentication                 Encryption                   Decryption
         │                             │                            │
         │                             │                            │
         ▼                             ▼                            ▼
   bcrypt.hash()              PBKDF2 + AES-256-GCM        PBKDF2 + AES-256-GCM
         │                             │                            │
         │                             │                            │
         ▼                             ▼                            ▼
   MasterPasswordHash         Encrypted Password         Plain Password
   (stored in DB)             (stored in DB)             (decrypted)
         │                             │                            │
         │                             │                            │
         └─────────────────────────────┴────────────────────────────┘
                                       │
                                       ▼
                        NEVER stored or logged in plain text
                        Only exists in memory during operation
```

## Bounded Context Map

```
┌────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                        AUTHENTICATION CONTEXT                       │
│                           (Upstream)                                │
│                                                                     │
│  Responsibilities:                                                  │
│  - User identity management                                        │
│  - Authentication (login, logout)                                  │
│  - Master password storage (hashed)                                │
│  - Session management                                              │
│  - Password change operations                                      │
│                                                                     │
│  Exposes:                                                          │
│  - User aggregate                                                  │
│  - Authentication services                                         │
│                                                                     │
└─────────────────────────────┬──────────────────────────────────────┘
                              │
                              │ Anti-Corruption Layer
                              │ (PasswordEntryRepository Port)
                              │
                              ▼
┌────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                        PASSWORDVAULT CONTEXT                        │
│                          (Downstream)                               │
│                                                                     │
│  Responsibilities:                                                  │
│  - Password entry management (CRUD)                                │
│  - Password encryption/decryption                                  │
│  - Password entry storage                                          │
│  - Password organization (folders, tags)                           │
│  - Password sharing                                                │
│                                                                     │
│  Implements:                                                       │
│  - PasswordEntryRepository (port from Authentication)              │
│  - Password encryption operations                                  │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

This architecture ensures:
- Clear separation of concerns
- Testability through dependency injection
- Flexibility to change implementations
- Protection against coupling between contexts
- Adherence to SOLID principles
