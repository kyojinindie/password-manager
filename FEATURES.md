# Password Manager - Features Atómicas

Este documento descompone el diseño del Password Manager en **features atómicas y completas** que pueden ser implementadas de forma independiente siguiendo TDD (Test-Driven Development).

---

## 📊 Resumen de Features

| # | Feature | Contexto | Complejidad | Prioridad | Dependencias |
|---|---------|----------|-------------|-----------|--------------|
| F0 | Setup Proyecto | Shared | Media | P0 | - |
| F1 | Shared Kernel | Shared | Media | P0 | F0 |
| F2 | Register User | Authentication | Alta | P0 | F0, F1 |
| F3 | Login User | Authentication | Alta | P0 | F2 |
| F4 | Logout User | Authentication | Baja | P1 | F3 |
| F5 | Refresh Session | Authentication | Media | P1 | F3 |
| F6 | Change Master Password | Authentication | Alta | P2 | F3, F7 |
| F7 | Create Password Entry | PasswordVault | Alta | P0 | F3 |
| F8 | List Password Entries | PasswordVault | Media | P0 | F7 |
| F9 | Find Password Entry | PasswordVault | Baja | P1 | F7 |
| F10 | Update Password Entry | PasswordVault | Media | P1 | F7, F9 |
| F11 | Delete Password Entry | PasswordVault | Baja | P1 | F7, F9 |
| F12 | Reveal Password | PasswordVault | Alta | P0 | F7, F9 |
| F13 | Search Password Entries | PasswordVault | Media | P1 | F8 |
| F14 | Generate Secure Password | PasswordVault | Media | P1 | F3 |
| F15 | Categorize Password Entry | PasswordVault | Baja | P2 | F7 |
| F16 | Tag Management | PasswordVault | Media | P2 | F7 |

**Complejidad**: Baja (1-2 días) | Media (3-5 días) | Alta (5-8 días)
**Prioridad**: P0 (Crítica/MVP) | P1 (Alta) | P2 (Media) | P3 (Baja)

---

## 🔧 F0: Setup Proyecto

### Descripción
Configuración inicial del proyecto TypeScript con todas las herramientas necesarias para DDD y Arquitectura Hexagonal.

### User Story
```
Como desarrollador
Quiero tener el proyecto configurado con TypeScript, ESLint, Prettier, Jest y TypeORM
Para poder comenzar a desarrollar siguiendo las reglas establecidas en CLAUDE.md
```

### Criterios de Aceptación
- [x] package.json configurado con scripts (build, dev, test, lint, format)
- [x] TypeScript configurado (tsconfig.json)
- [x] ESLint configurado según CLAUDE.md
- [x] Prettier configurado según CLAUDE.md
- [x] Jest configurado para testing
- [x] Estructura de carpetas creada (src/Contexts, tests/)
- [x] TypeORM configurado básicamente
- [x] Variables de entorno (.env.example)

### Entregables
- `package.json` con dependencias
- `tsconfig.json`
- `.eslintrc.json`
- `.prettierrc`
- `jest.config.js`
- Estructura de carpetas vacía
- `README.md` con instrucciones de setup

### Scripts Requeridos
```json
{
  "build": "tsc",
  "start": "node dist/apps/api/server.js",
  "dev": "ts-node-dev --respawn --transpile-only src/apps/api/server.ts",
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage",
  "lint": "eslint . --ext .ts",
  "lint:fix": "eslint . --ext .ts --fix",
  "format": "prettier --write \"src/**/*.ts\" \"tests/**/*.ts\"",
  "typecheck": "tsc --noEmit"
}
```

### Dependencias
- Ninguna

---

## 🧱 F1: Shared Kernel

### Descripción
Implementar las clases base compartidas por todos los Bounded Contexts.

### User Story
```
Como desarrollador
Quiero tener clases base para AggregateRoot, ValueObject, DomainEvent y Criteria
Para reutilizarlas en todos los contextos del sistema
```

### Criterios de Aceptación
- [x] AggregateRoot implementado con gestión de eventos de dominio
- [x] ValueObject<T> base implementado con método equals()
- [x] DomainEvent y BaseDomainEvent implementados
- [x] Criteria, Filters, Order implementados (patrón Specification)
- [x] EventBus interface definida
- [x] DomainException base implementada
- [x] Tests unitarios para todas las clases base

### Modelo de Dominio

**Clases Base**:
```typescript
// Contexts/Shared/domain/AggregateRoot.ts
export abstract class AggregateRoot {
  private domainEvents: DomainEvent[] = [];

  pullDomainEvents(): DomainEvent[]
  protected recordEvent(event: DomainEvent): void
  protected clearEvents(): void
}

// Contexts/Shared/domain/ValueObject.ts
export abstract class ValueObject<T> {
  constructor(protected readonly value: T)
  equals(other: ValueObject<T>): boolean
  toString(): string
}

// Contexts/Shared/domain/DomainEvent.ts
export interface DomainEvent {
  readonly eventId: string;
  readonly occurredOn: Date;
  readonly eventName: string;
}

export abstract class BaseDomainEvent implements DomainEvent {
  readonly eventId: string;
  readonly occurredOn: Date;
  readonly eventName: string;

  constructor(eventName: string)
}

// Contexts/Shared/domain/DomainException.ts
export abstract class DomainException extends Error {
  constructor(message: string)
}

// Contexts/Shared/domain/criteria/Criteria.ts
export class Criteria {
  constructor(
    readonly filters: Filters,
    readonly order: Order,
    readonly limit?: number,
    readonly offset?: number
  )
  hasFilters(): boolean
}

// Contexts/Shared/domain/EventBus.ts
export interface EventBus {
  publish(events: DomainEvent[]): Promise<void>;
}
```

### Tests Requeridos
- `tests/Contexts/Shared/domain/AggregateRoot.test.ts`
- `tests/Contexts/Shared/domain/ValueObject.test.ts`
- `tests/Contexts/Shared/domain/BaseDomainEvent.test.ts`
- `tests/Contexts/Shared/domain/criteria/Criteria.test.ts`

### Dependencias
- F0 (Setup Proyecto)

---

## 👤 F2: Register User

### Descripción
Permitir el registro de nuevos usuarios con email, username y Master Password.

### User Story
```
Como usuario nuevo
Quiero registrarme con mi email, username y una Master Password segura
Para poder comenzar a usar el password manager
```

### Criterios de Aceptación
- [x] El email debe ser único en el sistema
- [x] El username debe ser único en el sistema
- [x] La Master Password debe cumplir requisitos de complejidad (min 12 chars, mayúscula, minúscula, número, símbolo)
- [x] La Master Password se hashea con bcrypt (factor 12) antes de almacenar
- [x] Se genera un salt único para cada usuario
- [x] Se emite evento UserRegistered
- [x] Retorna el userId del usuario creado
- [x] Validación de formato de email
- [x] Errores claros si email/username ya existen

### Modelo de Dominio

**Entidades**:
```typescript
// User (Aggregate Root)
class User extends AggregateRoot {
  private readonly _id: UserId;
  private _email: Email;
  private _username: Username;
  private _masterPasswordHash: MasterPasswordHash;
  private _salt: string;
  private _isActive: boolean;
  private _createdAt: Date;

  static create(email: Email, username: Username, masterPassword: string): User
}
```

**Value Objects**:
```typescript
class UserId extends ValueObject<string> {
  static generate(): UserId
}

class Email extends ValueObject<string> {
  validate(): void
  get domain(): string
}

class Username extends ValueObject<string> {
  validate(): void // min 3, max 50
}

class MasterPasswordHash extends ValueObject<string> {
  static fromPlainPassword(password: string, salt: string): MasterPasswordHash
  verify(plainPassword: string, salt: string): boolean
}
```

**Servicios de Dominio**:
```typescript
class MasterPasswordHashingService {
  hash(password: string, salt: string): string
  verify(password: string, hash: string, salt: string): boolean
  generateSalt(): string
  validateComplexity(password: string): void
}
```

**Repositorio**:
```typescript
interface UserRepository {
  save(user: User): Promise<void>;
  findByEmail(email: Email): Promise<User | null>;
  findByUsername(username: Username): Promise<User | null>;
}
```

**Eventos**:
```typescript
class UserRegistered extends BaseDomainEvent {
  constructor(
    readonly userId: string,
    readonly email: string,
    readonly username: string
  )
}
```

### Casos de Uso

**UserRegistrar**:
```typescript
// application/Register/UserRegistrar.ts
class UserRegistrar {
  constructor(
    private userRepository: UserRepository,
    private hashingService: MasterPasswordHashingService,
    private eventBus: EventBus
  )

  async run(request: RegisterUserRequest): Promise<string>
}

interface RegisterUserRequest {
  email: string;
  username: string;
  masterPassword: string;
}
```

### Endpoints API

**POST /api/auth/register**

Request:
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "masterPassword": "SecureP@ssw0rd123!"
}
```

Response (201 Created):
```json
{
  "userId": "uuid-here",
  "email": "user@example.com",
  "username": "johndoe"
}
```

Errores:
- 400 Bad Request: Email inválido, Master Password débil
- 409 Conflict: Email o Username ya existen

### Tests Requeridos

**Dominio**:
- `User.test.ts`: Crear usuario, validaciones
- `Email.test.ts`: Validación de formato
- `Username.test.ts`: Validación de longitud
- `MasterPasswordHash.test.ts`: Hashing y verificación

**Aplicación**:
- `UserRegistrar.test.ts`:
  - Registro exitoso
  - Email duplicado
  - Username duplicado
  - Master Password débil
  - Email inválido

**Integración**:
- `UserRegistrar.integration.test.ts`: Registro end-to-end con BD in-memory

### Dependencias
- F0 (Setup Proyecto)
- F1 (Shared Kernel)

---

## 🔐 F3: Login User

### Descripción
Autenticar usuarios existentes y generar tokens de sesión JWT.

### User Story
```
Como usuario registrado
Quiero iniciar sesión con mi email y Master Password
Para acceder a mi bóveda de contraseñas
```

### Criterios de Aceptación
- [x] Validar email y Master Password contra la BD
- [x] Generar Access Token JWT (15 min expiración)
- [x] Generar Refresh Token (7 días expiración)
- [x] Registrar fecha de último login
- [x] Incrementar contador de intentos fallidos
- [x] Bloquear cuenta tras 5 intentos fallidos
- [x] Resetear contador tras login exitoso
- [x] Emitir evento UserLoggedIn

### Modelo de Dominio

**Modificaciones a User**:
```typescript
class User extends AggregateRoot {
  private _lastLoginAt: Date | null;
  private _failedLoginAttempts: number;

  authenticate(masterPassword: string): boolean
  recordLogin(): void
  incrementFailedAttempts(): void
  resetFailedAttempts(): void
  isLocked(): boolean
}
```

**Value Objects**:
```typescript
class SessionToken extends ValueObject<string> {
  static generate(userId: UserId, expiresIn: number): SessionToken
  isExpired(): boolean
  get payload(): TokenPayload
}

interface TokenPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}
```

**Repositorio** (actualización):
```typescript
interface UserRepository {
  findById(id: UserId): Promise<User | null>;
  // ... otros métodos
}
```

**Eventos**:
```typescript
class UserLoggedIn extends BaseDomainEvent {
  constructor(
    readonly userId: string,
    readonly loginAt: Date
  )
}
```

### Casos de Uso

**UserAuthenticator**:
```typescript
// application/Login/UserAuthenticator.ts
class UserAuthenticator {
  constructor(
    private userRepository: UserRepository,
    private hashingService: MasterPasswordHashingService,
    private tokenService: TokenService,
    private eventBus: EventBus
  )

  async run(request: LoginRequest): Promise<LoginResponse>
}

interface LoginRequest {
  email: string;
  masterPassword: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
```

**Puertos de Infraestructura**:
```typescript
interface TokenService {
  generateAccessToken(userId: string, email: string): string;
  generateRefreshToken(userId: string): string;
  verifyToken(token: string): TokenPayload;
}
```

### Endpoints API

**POST /api/auth/login**

Request:
```json
{
  "email": "user@example.com",
  "masterPassword": "SecureP@ssw0rd123!"
}
```

Response (200 OK):
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh-token-here",
  "expiresIn": 900
}
```

Errores:
- 401 Unauthorized: Credenciales inválidas
- 423 Locked: Cuenta bloqueada por intentos fallidos

### Tests Requeridos

**Dominio**:
- `User.test.ts`: authenticate(), recordLogin(), incrementFailedAttempts(), isLocked()

**Aplicación**:
- `UserAuthenticator.test.ts`:
  - Login exitoso
  - Credenciales inválidas
  - Usuario no existe
  - Cuenta bloqueada
  - Reset de intentos fallidos tras login exitoso

**Integración**:
- `UserAuthenticator.integration.test.ts`

### Dependencias
- F2 (Register User)

---

## 🚪 F4: Logout User

### Descripción
Cerrar sesión del usuario invalidando su token de acceso.

### User Story
```
Como usuario autenticado
Quiero cerrar sesión
Para invalidar mi token de acceso
```

### Criterios de Aceptación
- [x] Invalidar el access token actual
- [x] Invalidar el refresh token
- [x] Emitir evento UserLoggedOut
- [x] Requiere autenticación previa

### Modelo de Dominio

**Eventos**:
```typescript
class UserLoggedOut extends BaseDomainEvent {
  constructor(readonly userId: string)
}
```

### Casos de Uso

**UserLogout**:
```typescript
// application/Logout/UserLogout.ts
class UserLogout {
  constructor(
    private tokenBlacklist: TokenBlacklistService,
    private eventBus: EventBus
  )

  async run(request: LogoutRequest): Promise<void>
}

interface LogoutRequest {
  userId: string;
  accessToken: string;
}
```

**Puertos**:
```typescript
interface TokenBlacklistService {
  addToBlacklist(token: string, expiresAt: Date): Promise<void>;
  isBlacklisted(token: string): Promise<boolean>;
}
```

### Endpoints API

**POST /api/auth/logout**

Headers:
```
Authorization: Bearer {accessToken}
```

Response (204 No Content)

### Tests Requeridos

**Aplicación**:
- `UserLogout.test.ts`: Logout exitoso, token invalidado

### Dependencias
- F3 (Login User)

---

## 🔄 F5: Refresh Session

### Descripción
Renovar el access token usando un refresh token válido.

### User Story
```
Como usuario con sesión expirada
Quiero renovar mi access token usando el refresh token
Para continuar usando la aplicación sin volver a hacer login
```

### Criterios de Aceptación
- [x] Validar refresh token
- [x] Generar nuevo access token
- [x] Mantener el mismo refresh token (o generar uno nuevo opcionalmente)
- [x] Verificar que el refresh token no esté en blacklist

### Casos de Uso

**SessionRefresher**:
```typescript
// application/RefreshSession/SessionRefresher.ts
class SessionRefresher {
  constructor(
    private tokenService: TokenService,
    private tokenBlacklist: TokenBlacklistService,
    private userRepository: UserRepository
  )

  async run(request: RefreshSessionRequest): Promise<RefreshSessionResponse>
}

interface RefreshSessionRequest {
  refreshToken: string;
}

interface RefreshSessionResponse {
  accessToken: string;
  expiresIn: number;
}
```

### Endpoints API

**POST /api/auth/refresh**

Request:
```json
{
  "refreshToken": "refresh-token-here"
}
```

Response (200 OK):
```json
{
  "accessToken": "new-access-token",
  "expiresIn": 900
}
```

Errores:
- 401 Unauthorized: Refresh token inválido o expirado

### Tests Requeridos

**Aplicación**:
- `SessionRefresher.test.ts`:
  - Refresh exitoso
  - Token inválido
  - Token expirado
  - Token en blacklist

### Dependencias
- F3 (Login User)

---

## 🔑 F6: Change Master Password

### Descripción
Cambiar la Master Password del usuario, re-encriptando todas sus contraseñas almacenadas.

### User Story
```
Como usuario autenticado
Quiero cambiar mi Master Password
Para actualizar mi clave de seguridad principal
```

### Criterios de Aceptación
- [x] Validar la Master Password actual
- [x] Validar complejidad de la nueva Master Password
- [x] Actualizar el hash de la Master Password
- [x] Re-encriptar TODAS las contraseñas del usuario con la nueva Master Password
- [x] Emitir evento MasterPasswordChanged
- [x] Invalidar todos los tokens activos (forzar re-login)

### Modelo de Dominio

**Modificaciones a User**:
```typescript
class User extends AggregateRoot {
  changeMasterPassword(currentPassword: string, newPassword: string): void
}
```

**Eventos**:
```typescript
class MasterPasswordChanged extends BaseDomainEvent {
  constructor(
    readonly userId: string,
    readonly changedAt: Date
  )
}
```

### Casos de Uso

**MasterPasswordChanger**:
```typescript
// application/ChangePassword/MasterPasswordChanger.ts
class MasterPasswordChanger {
  constructor(
    private userRepository: UserRepository,
    private hashingService: MasterPasswordHashingService,
    private passwordEntryRepository: PasswordEntryRepository,
    private encryptionService: PasswordEncryptionService,
    private eventBus: EventBus
  )

  async run(request: ChangePasswordRequest): Promise<void>
}

interface ChangePasswordRequest {
  userId: string;
  currentPassword: string;
  newPassword: string;
}
```

**Lógica Especial**:
1. Validar current password
2. Obtener TODAS las password entries del usuario
3. Desencriptar cada password con current password
4. Re-encriptar cada password con new password
5. Actualizar user con nuevo hash
6. Guardar todas las password entries actualizadas
7. Emitir evento

### Endpoints API

**PUT /api/auth/password**

Headers:
```
Authorization: Bearer {accessToken}
```

Request:
```json
{
  "currentPassword": "OldP@ssw0rd123!",
  "newPassword": "NewP@ssw0rd456!"
}
```

Response (204 No Content)

Errores:
- 401 Unauthorized: Current password incorrecta
- 400 Bad Request: Nueva password débil

### Tests Requeridos

**Dominio**:
- `User.test.ts`: changeMasterPassword()

**Aplicación**:
- `MasterPasswordChanger.test.ts`:
  - Cambio exitoso
  - Current password incorrecta
  - Nueva password débil
  - Re-encriptación de todas las entries

### Dependencias
- F3 (Login User)
- F7 (Create Password Entry) - para la re-encriptación

---

## 📝 F7: Create Password Entry

### Descripción
Crear una nueva entrada de contraseña encriptada en la bóveda del usuario.

### User Story
```
Como usuario autenticado
Quiero guardar una nueva contraseña para un sitio web o aplicación
Para poder acceder a ella de forma segura más tarde
```

### Criterios de Aceptación
- [x] Sitio/App name es obligatorio
- [x] Password se encripta con AES-256-GCM antes de guardar
- [x] Username es obligatorio
- [x] URL es opcional pero debe ser válida si se proporciona
- [x] Category tiene valores predefinidos (PERSONAL, WORK, FINANCE, SOCIAL, EMAIL, SHOPPING, OTHER)
- [x] Notes es opcional (max 1000 caracteres)
- [x] Tags son opcionales (array de strings)
- [x] Solo el propietario puede crear entries
- [x] Emitir evento PasswordEntryCreated
- [x] Retornar el PasswordEntryId

### Modelo de Dominio

**Entidades**:
```typescript
// PasswordEntry (Aggregate Root)
class PasswordEntry extends AggregateRoot {
  private readonly _id: PasswordEntryId;
  private readonly _userId: UserId;
  private _siteName: SiteName;
  private _siteUrl: SiteUrl | null;
  private _username: Username;
  private _encryptedPassword: EncryptedPassword;
  private _category: Category;
  private _notes: Notes | null;
  private _tags: Tag[];
  private _createdAt: Date;
  private _updatedAt: Date;

  static create(
    userId: UserId,
    siteName: SiteName,
    siteUrl: SiteUrl | null,
    username: Username,
    encryptedPassword: EncryptedPassword,
    category: Category,
    notes: Notes | null,
    tags: Tag[]
  ): PasswordEntry

  belongsToUser(userId: UserId): boolean
}
```

**Value Objects**:
```typescript
class PasswordEntryId extends ValueObject<string> {
  static generate(): PasswordEntryId
}

class SiteName extends ValueObject<string> {
  validate(): void // no vacío, max 100 chars
}

class SiteUrl extends ValueObject<string> {
  validate(): void // formato URL válido
  get domain(): string
}

class Username extends ValueObject<string> {
  validate(): void
}

class EncryptedPassword extends ValueObject<string> {
  static encrypt(plainPassword: string, masterPassword: string): EncryptedPassword
  decrypt(masterPassword: string): string
}

enum CategoryType {
  PERSONAL = 'PERSONAL',
  WORK = 'WORK',
  FINANCE = 'FINANCE',
  SOCIAL = 'SOCIAL',
  EMAIL = 'EMAIL',
  SHOPPING = 'SHOPPING',
  OTHER = 'OTHER'
}

class Category extends ValueObject<CategoryType> {
  static personal(): Category
  static work(): Category
  // ... otros
}

class Notes extends ValueObject<string> {
  validate(): void // max 1000 chars
}

class Tag extends ValueObject<string> {
  validate(): void // lowercase, max 30 chars, sin espacios
}
```

**Servicios de Dominio**:
```typescript
class PasswordEncryptionService {
  encrypt(plainPassword: string, masterPassword: string): string
  decrypt(encryptedPassword: string, masterPassword: string): string
}
```

**Repositorio**:
```typescript
interface PasswordEntryRepository {
  save(entry: PasswordEntry): Promise<void>;
  findById(id: PasswordEntryId): Promise<PasswordEntry | null>;
  findByUserId(userId: UserId): Promise<PasswordEntry[]>;
}
```

**Eventos**:
```typescript
class PasswordEntryCreated extends BaseDomainEvent {
  constructor(
    readonly entryId: string,
    readonly userId: string,
    readonly siteName: string
  )
}
```

### Casos de Uso

**PasswordEntryCreator**:
```typescript
// application/Create/PasswordEntryCreator.ts
class PasswordEntryCreator {
  constructor(
    private repository: PasswordEntryRepository,
    private encryptionService: PasswordEncryptionService,
    private eventBus: EventBus
  )

  async run(request: CreatePasswordEntryRequest): Promise<string>
}

interface CreatePasswordEntryRequest {
  userId: string;
  siteName: string;
  siteUrl?: string;
  username: string;
  password: string; // plaintext, se encripta
  category: string;
  notes?: string;
  tags?: string[];
}
```

### Endpoints API

**POST /api/passwords**

Headers:
```
Authorization: Bearer {accessToken}
```

Request:
```json
{
  "siteName": "GitHub",
  "siteUrl": "https://github.com",
  "username": "johndoe",
  "password": "myGithubPassword123",
  "category": "WORK",
  "notes": "Personal GitHub account",
  "tags": ["development", "code"]
}
```

Response (201 Created):
```json
{
  "id": "entry-uuid",
  "siteName": "GitHub",
  "siteUrl": "https://github.com",
  "username": "johndoe",
  "category": "WORK",
  "notes": "Personal GitHub account",
  "tags": ["development", "code"],
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-15T10:30:00Z"
}
```

Errores:
- 400 Bad Request: Datos inválidos
- 401 Unauthorized: No autenticado

### Tests Requeridos

**Dominio**:
- `PasswordEntry.test.ts`: Crear entry, validaciones
- `SiteName.test.ts`: Validación
- `EncryptedPassword.test.ts`: Encriptar/desencriptar
- `Category.test.ts`: Valores válidos
- `Tag.test.ts`: Formato válido

**Aplicación**:
- `PasswordEntryCreator.test.ts`:
  - Creación exitosa
  - Password se encripta correctamente
  - Validaciones de campos

**Integración**:
- `PasswordEntryCreator.integration.test.ts`

### Dependencias
- F3 (Login User)

---

## 📋 F8: List Password Entries

### Descripción
Listar todas las entradas de contraseñas del usuario con paginación y ordenamiento.

### User Story
```
Como usuario autenticado
Quiero ver una lista de todas mis contraseñas guardadas
Para acceder rápidamente a ellas
```

### Criterios de Aceptación
- [x] Solo mostrar entries del usuario autenticado
- [x] Soportar paginación (page, limit)
- [x] Soportar ordenamiento (siteName, createdAt, category)
- [x] Passwords retornadas ENCRIPTADAS (no revelar)
- [x] Incluir metadatos de paginación (total, totalPages)

### Casos de Uso

**PasswordEntriesLister**:
```typescript
// application/List/PasswordEntriesLister.ts
class PasswordEntriesLister {
  constructor(private repository: PasswordEntryRepository)

  async run(request: ListPasswordEntriesRequest): Promise<PasswordEntriesResponse>
}

interface ListPasswordEntriesRequest {
  userId: string;
  page?: number; // default 1
  limit?: number; // default 20
  sortBy?: 'siteName' | 'createdAt' | 'category'; // default siteName
  sortOrder?: 'asc' | 'desc'; // default asc
}

interface PasswordEntriesResponse {
  data: PasswordEntryDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface PasswordEntryDTO {
  id: string;
  siteName: string;
  siteUrl?: string;
  username: string;
  category: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Endpoints API

**GET /api/passwords?page=1&limit=20&sortBy=siteName&sortOrder=asc**

Headers:
```
Authorization: Bearer {accessToken}
```

Response (200 OK):
```json
{
  "data": [
    {
      "id": "entry-uuid-1",
      "siteName": "GitHub",
      "siteUrl": "https://github.com",
      "username": "johndoe",
      "category": "WORK",
      "tags": ["development"],
      "createdAt": "2025-01-15T10:30:00Z",
      "updatedAt": "2025-01-15T10:30:00Z"
    },
    {
      "id": "entry-uuid-2",
      "siteName": "Gmail",
      "username": "john.doe@gmail.com",
      "category": "PERSONAL",
      "tags": ["email"],
      "createdAt": "2025-01-14T09:00:00Z",
      "updatedAt": "2025-01-14T09:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

### Tests Requeridos

**Aplicación**:
- `PasswordEntriesLister.test.ts`:
  - Listar con paginación
  - Ordenamiento por diferentes campos
  - Usuario sin entries
  - Solo entries del usuario autenticado

### Dependencias
- F7 (Create Password Entry)

---

## 🔍 F9: Find Password Entry

### Descripción
Buscar una entrada específica por ID.

### User Story
```
Como usuario autenticado
Quiero buscar una entrada específica por ID
Para ver sus detalles completos
```

### Criterios de Aceptación
- [x] Solo el propietario puede ver la entry
- [x] Retornar 404 si no existe
- [x] Retornar 403 si no pertenece al usuario
- [x] Password retornado ENCRIPTADO
- [x] Incluir notas completas

### Casos de Uso

**PasswordEntryFinder**:
```typescript
// application/Find/PasswordEntryFinder.ts
class PasswordEntryFinder {
  constructor(private repository: PasswordEntryRepository)

  async run(request: FindPasswordEntryRequest): Promise<PasswordEntryResponse>
}

interface FindPasswordEntryRequest {
  entryId: string;
  userId: string;
}

interface PasswordEntryResponse {
  id: string;
  siteName: string;
  siteUrl?: string;
  username: string;
  category: string;
  notes?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt?: Date;
}
```

### Endpoints API

**GET /api/passwords/:id**

Headers:
```
Authorization: Bearer {accessToken}
```

Response (200 OK):
```json
{
  "id": "entry-uuid",
  "siteName": "GitHub",
  "siteUrl": "https://github.com",
  "username": "johndoe",
  "category": "WORK",
  "notes": "Personal GitHub account for side projects",
  "tags": ["development", "code"],
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-15T10:30:00Z",
  "lastAccessedAt": "2025-01-16T14:20:00Z"
}
```

Errores:
- 404 Not Found: Entry no existe
- 403 Forbidden: Entry no pertenece al usuario

### Tests Requeridos

**Aplicación**:
- `PasswordEntryFinder.test.ts`:
  - Find exitoso
  - Entry no existe
  - Entry no pertenece al usuario

### Dependencias
- F7 (Create Password Entry)

---

## ✏️ F10: Update Password Entry

### Descripción
Actualizar una entrada de contraseña existente.

### User Story
```
Como usuario autenticado
Quiero actualizar la información de una contraseña guardada
Para mantener mis credenciales actualizadas
```

### Criterios de Aceptación
- [x] Solo el propietario puede actualizar
- [x] Permitir actualizar: siteName, siteUrl, username, password, category, notes, tags
- [x] Si se actualiza password, re-encriptar
- [x] Actualizar updatedAt timestamp
- [x] Emitir evento PasswordEntryUpdated

### Modelo de Dominio

**Modificaciones a PasswordEntry**:
```typescript
class PasswordEntry extends AggregateRoot {
  updateSiteName(siteName: SiteName): void
  updateSiteUrl(siteUrl: SiteUrl | null): void
  updateCredentials(username: Username, encryptedPassword: EncryptedPassword): void
  updateCategory(category: Category): void
  updateNotes(notes: Notes | null): void
  setTags(tags: Tag[]): void
  addTag(tag: Tag): void
  removeTag(tag: Tag): void
}
```

**Eventos**:
```typescript
class PasswordEntryUpdated extends BaseDomainEvent {
  constructor(
    readonly entryId: string,
    readonly userId: string,
    readonly updatedFields: string[]
  )
}
```

### Casos de Uso

**PasswordEntryUpdater**:
```typescript
// application/Update/PasswordEntryUpdater.ts
class PasswordEntryUpdater {
  constructor(
    private repository: PasswordEntryRepository,
    private encryptionService: PasswordEncryptionService,
    private eventBus: EventBus
  )

  async run(request: UpdatePasswordEntryRequest): Promise<void>
}

interface UpdatePasswordEntryRequest {
  entryId: string;
  userId: string;
  siteName?: string;
  siteUrl?: string;
  username?: string;
  password?: string; // si se provee, re-encriptar
  category?: string;
  notes?: string;
  tags?: string[];
}
```

### Endpoints API

**PUT /api/passwords/:id**

Headers:
```
Authorization: Bearer {accessToken}
```

Request:
```json
{
  "siteName": "GitHub Enterprise",
  "username": "john.doe",
  "password": "newPassword456",
  "notes": "Work GitHub account"
}
```

Response (200 OK):
```json
{
  "id": "entry-uuid",
  "siteName": "GitHub Enterprise",
  "siteUrl": "https://github.com",
  "username": "john.doe",
  "category": "WORK",
  "notes": "Work GitHub account",
  "tags": ["development", "code"],
  "updatedAt": "2025-01-16T15:00:00Z"
}
```

Errores:
- 404 Not Found
- 403 Forbidden
- 400 Bad Request: Datos inválidos

### Tests Requeridos

**Dominio**:
- `PasswordEntry.test.ts`: Métodos de actualización

**Aplicación**:
- `PasswordEntryUpdater.test.ts`:
  - Actualización exitosa
  - Re-encriptación de password
  - Entry no existe
  - No pertenece al usuario

### Dependencias
- F7 (Create Password Entry)
- F9 (Find Password Entry)

---

## 🗑️ F11: Delete Password Entry

### Descripción
Eliminar permanentemente una entrada de contraseña.

### User Story
```
Como usuario autenticado
Quiero eliminar una contraseña guardada
Para limpiar mi bóveda de credenciales obsoletas
```

### Criterios de Aceptación
- [x] Solo el propietario puede eliminar
- [x] Eliminación permanente (hard delete por seguridad)
- [x] Emitir evento PasswordEntryDeleted
- [x] Retornar 404 si no existe

### Modelo de Dominio

**Eventos**:
```typescript
class PasswordEntryDeleted extends BaseDomainEvent {
  constructor(
    readonly entryId: string,
    readonly userId: string
  )
}
```

**Repositorio** (actualización):
```typescript
interface PasswordEntryRepository {
  delete(id: PasswordEntryId): Promise<void>;
  // ... otros métodos
}
```

### Casos de Uso

**PasswordEntryDeleter**:
```typescript
// application/Delete/PasswordEntryDeleter.ts
class PasswordEntryDeleter {
  constructor(
    private repository: PasswordEntryRepository,
    private eventBus: EventBus
  )

  async run(request: DeletePasswordEntryRequest): Promise<void>
}

interface DeletePasswordEntryRequest {
  entryId: string;
  userId: string;
}
```

### Endpoints API

**DELETE /api/passwords/:id**

Headers:
```
Authorization: Bearer {accessToken}
```

Response (204 No Content)

Errores:
- 404 Not Found
- 403 Forbidden

### Tests Requeridos

**Aplicación**:
- `PasswordEntryDeleter.test.ts`:
  - Eliminación exitosa
  - Entry no existe
  - No pertenece al usuario

### Dependencias
- F7 (Create Password Entry)
- F9 (Find Password Entry)

---

## 👁️ F12: Reveal Password

### Descripción
Desencriptar y revelar la contraseña en texto plano de una entrada.

### User Story
```
Como usuario autenticado
Quiero revelar la contraseña en texto plano de una entrada
Para copiarla y usarla en el sitio correspondiente
```

### Criterios de Aceptación
- [x] Requiere la Master Password para desencriptar
- [x] Solo el propietario puede revelar
- [x] Validar Master Password antes de desencriptar
- [x] Registrar evento de acceso (auditoría)
- [x] Actualizar lastAccessedAt timestamp
- [x] Emitir evento PasswordRevealed

### Modelo de Dominio

**Modificaciones a PasswordEntry**:
```typescript
class PasswordEntry extends AggregateRoot {
  private _lastAccessedAt: Date | null;

  recordAccess(): void
}
```

**Eventos**:
```typescript
class PasswordRevealed extends BaseDomainEvent {
  constructor(
    readonly entryId: string,
    readonly userId: string,
    readonly revealedAt: Date
  )
}
```

### Casos de Uso

**PasswordRevealer**:
```typescript
// application/Reveal/PasswordRevealer.ts
class PasswordRevealer {
  constructor(
    private entryRepository: PasswordEntryRepository,
    private userRepository: UserRepository,
    private hashingService: MasterPasswordHashingService,
    private encryptionService: PasswordEncryptionService,
    private eventBus: EventBus
  )

  async run(request: RevealPasswordRequest): Promise<RevealPasswordResponse>
}

interface RevealPasswordRequest {
  entryId: string;
  userId: string;
  masterPassword: string;
}

interface RevealPasswordResponse {
  password: string; // plaintext
}
```

### Endpoints API

**POST /api/passwords/:id/reveal**

Headers:
```
Authorization: Bearer {accessToken}
```

Request:
```json
{
  "masterPassword": "SecureP@ssw0rd123!"
}
```

Response (200 OK):
```json
{
  "password": "myGithubPassword123"
}
```

Errores:
- 401 Unauthorized: Master Password incorrecta
- 404 Not Found
- 403 Forbidden

### Tests Requeridos

**Dominio**:
- `PasswordEntry.test.ts`: recordAccess()
- `EncryptedPassword.test.ts`: decrypt()

**Aplicación**:
- `PasswordRevealer.test.ts`:
  - Reveal exitoso
  - Master Password incorrecta
  - Entry no existe
  - No pertenece al usuario
  - lastAccessedAt se actualiza

### Dependencias
- F7 (Create Password Entry)
- F9 (Find Password Entry)

---

## 🔎 F13: Search Password Entries

### Descripción
Buscar entradas de contraseñas por criterios (siteName, category, tags, username).

### User Story
```
Como usuario autenticado
Quiero buscar mis contraseñas por nombre de sitio, categoría o tags
Para encontrar rápidamente la que necesito
```

### Criterios de Aceptación
- [x] Búsqueda por siteName (case-insensitive, partial match)
- [x] Filtrar por category
- [x] Filtrar por tags (OR logic)
- [x] Filtrar por username
- [x] Combinar múltiples criterios (AND logic)
- [x] Solo entries del usuario autenticado

### Modelo de Dominio

**Repositorio** (actualización):
```typescript
interface PasswordEntryRepository {
  findByUserIdAndCriteria(userId: UserId, criteria: Criteria): Promise<PasswordEntry[]>;
  // ... otros métodos
}
```

### Casos de Uso

**PasswordEntriesSearcher**:
```typescript
// application/Search/PasswordEntriesSearcher.ts
class PasswordEntriesSearcher {
  constructor(private repository: PasswordEntryRepository)

  async run(request: SearchPasswordEntriesRequest): Promise<PasswordEntriesResponse>
}

interface SearchPasswordEntriesRequest {
  userId: string;
  query?: string; // búsqueda en siteName
  category?: string;
  tags?: string[]; // OR logic
  username?: string;
}
```

### Endpoints API

**GET /api/passwords/search?q=github&category=WORK&tags=development,code**

Headers:
```
Authorization: Bearer {accessToken}
```

Response (200 OK):
```json
{
  "data": [
    {
      "id": "entry-uuid",
      "siteName": "GitHub",
      "username": "johndoe",
      "category": "WORK",
      "tags": ["development", "code"]
    }
  ],
  "count": 1
}
```

### Tests Requeridos

**Aplicación**:
- `PasswordEntriesSearcher.test.ts`:
  - Búsqueda por siteName
  - Filtro por category
  - Filtro por tags
  - Combinación de criterios
  - Sin resultados

### Dependencias
- F8 (List Password Entries)

---

## 🎲 F14: Generate Secure Password

### Descripción
Generar contraseñas seguras con diferentes opciones de configuración.

### User Story
```
Como usuario autenticado
Quiero generar una contraseña segura y aleatoria
Para usarla al crear nuevas cuentas
```

### Criterios de Aceptación
- [x] Longitud configurable (min 8, max 128, default 16)
- [x] Incluir/excluir mayúsculas (default: true)
- [x] Incluir/excluir minúsculas (default: true)
- [x] Incluir/excluir números (default: true)
- [x] Incluir/excluir símbolos (default: true)
- [x] Excluir caracteres ambiguos (0, O, l, 1) (default: true)
- [x] Al menos un tipo de carácter debe estar habilitado
- [x] Usar crypto.randomBytes para aleatoriedad segura

### Modelo de Dominio

**Servicios de Dominio**:
```typescript
class PasswordGeneratorService {
  generate(options: PasswordGeneratorOptions): string
}

interface PasswordGeneratorOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeAmbiguous: boolean;
}
```

### Casos de Uso

**SecurePasswordGenerator**:
```typescript
// application/Generate/SecurePasswordGenerator.ts
class SecurePasswordGenerator {
  constructor(private generatorService: PasswordGeneratorService)

  run(request: GeneratePasswordRequest): GeneratePasswordResponse
}

interface GeneratePasswordRequest {
  length?: number;
  includeUppercase?: boolean;
  includeLowercase?: boolean;
  includeNumbers?: boolean;
  includeSymbols?: boolean;
  excludeAmbiguous?: boolean;
}

interface GeneratePasswordResponse {
  password: string;
}
```

### Endpoints API

**POST /api/passwords/generate**

Headers:
```
Authorization: Bearer {accessToken}
```

Request:
```json
{
  "length": 20,
  "includeUppercase": true,
  "includeLowercase": true,
  "includeNumbers": true,
  "includeSymbols": true,
  "excludeAmbiguous": true
}
```

Response (200 OK):
```json
{
  "password": "Kx9#mP2$vL8@qR5!wZ3%"
}
```

Errores:
- 400 Bad Request: Longitud inválida, ningún tipo de carácter habilitado

### Tests Requeridos

**Dominio**:
- `PasswordGeneratorService.test.ts`:
  - Generar con diferentes opciones
  - Validar longitud
  - Validar tipos de caracteres incluidos
  - Excluir ambiguos
  - Al menos un tipo habilitado

**Aplicación**:
- `SecurePasswordGenerator.test.ts`:
  - Generación exitosa
  - Opciones inválidas

### Dependencias
- F3 (Login User)

---

## 🏷️ F15: Categorize Password Entry

### Descripción
Actualizar la categoría de una entrada de contraseña.

### User Story
```
Como usuario autenticado
Quiero cambiar la categoría de una contraseña
Para organizar mejor mi bóveda
```

### Criterios de Aceptación
- [x] Solo el propietario puede cambiar categoría
- [x] Categorías válidas: PERSONAL, WORK, FINANCE, SOCIAL, EMAIL, SHOPPING, OTHER
- [x] Actualizar updatedAt

### Casos de Uso

**PasswordEntryCategorizer**:
```typescript
// application/Categorize/PasswordEntryCategorizer.ts
class PasswordEntryCategorizer {
  constructor(
    private repository: PasswordEntryRepository,
    private eventBus: EventBus
  )

  async run(request: CategorizePasswordEntryRequest): Promise<void>
}

interface CategorizePasswordEntryRequest {
  entryId: string;
  userId: string;
  category: string;
}
```

### Endpoints API

**PATCH /api/passwords/:id/category**

Headers:
```
Authorization: Bearer {accessToken}
```

Request:
```json
{
  "category": "FINANCE"
}
```

Response (200 OK):
```json
{
  "id": "entry-uuid",
  "category": "FINANCE",
  "updatedAt": "2025-01-16T16:00:00Z"
}
```

### Tests Requeridos

**Aplicación**:
- `PasswordEntryCategorizer.test.ts`:
  - Cambio exitoso
  - Categoría inválida
  - No pertenece al usuario

### Dependencias
- F7 (Create Password Entry)

---

## 🏷️ F16: Tag Management

### Descripción
Agregar y remover tags de una entrada de contraseña.

### User Story
```
Como usuario autenticado
Quiero agregar y remover tags de mis contraseñas
Para organizarlas y buscarlas más fácilmente
```

### Criterios de Aceptación
- [x] Solo el propietario puede gestionar tags
- [x] Tags deben ser lowercase, max 30 chars, sin espacios
- [x] Permitir agregar múltiples tags a la vez
- [x] Permitir remover tags específicos
- [x] No duplicar tags

### Casos de Uso

**TagManager**:
```typescript
// application/ManageTags/TagManager.ts
class TagManager {
  constructor(
    private repository: PasswordEntryRepository,
    private eventBus: EventBus
  )

  async addTags(request: AddTagsRequest): Promise<void>
  async removeTags(request: RemoveTagsRequest): Promise<void>
}

interface AddTagsRequest {
  entryId: string;
  userId: string;
  tags: string[];
}

interface RemoveTagsRequest {
  entryId: string;
  userId: string;
  tags: string[];
}
```

### Endpoints API

**POST /api/passwords/:id/tags**

Headers:
```
Authorization: Bearer {accessToken}
```

Request:
```json
{
  "tags": ["important", "banking"]
}
```

Response (200 OK):
```json
{
  "id": "entry-uuid",
  "tags": ["development", "code", "important", "banking"],
  "updatedAt": "2025-01-16T16:30:00Z"
}
```

**DELETE /api/passwords/:id/tags**

Request:
```json
{
  "tags": ["code"]
}
```

Response (200 OK):
```json
{
  "id": "entry-uuid",
  "tags": ["development", "important", "banking"],
  "updatedAt": "2025-01-16T16:35:00Z"
}
```

### Tests Requeridos

**Dominio**:
- `PasswordEntry.test.ts`: addTag(), removeTag(), no duplicados

**Aplicación**:
- `TagManager.test.ts`:
  - Agregar tags
  - Remover tags
  - Tag inválido
  - No pertenece al usuario

### Dependencias
- F7 (Create Password Entry)

---

## 📊 Roadmap de Implementación

### Fase 0: Fundación (Semana 1)
- F0: Setup Proyecto
- F1: Shared Kernel

### Fase 1: Autenticación MVP (Semana 2-3)
- F2: Register User
- F3: Login User
- F4: Logout User

### Fase 2: Password Vault MVP (Semana 4-5)
- F7: Create Password Entry
- F8: List Password Entries
- F9: Find Password Entry
- F12: Reveal Password

### Fase 3: Gestión Avanzada (Semana 6-7)
- F10: Update Password Entry
- F11: Delete Password Entry
- F13: Search Password Entries
- F14: Generate Secure Password

### Fase 4: Organización y Seguridad (Semana 8)
- F5: Refresh Session
- F15: Categorize Password Entry
- F16: Tag Management

### Fase 5: Seguridad Avanzada (Semana 9)
- F6: Change Master Password

---

## 🎯 Criterios de Definición de "Done" (DoD)

Para considerar una feature completa, debe cumplir:

- [ ] Modelo de dominio implementado con lógica de negocio
- [ ] Value Objects con validaciones
- [ ] Tests unitarios de dominio (> 90% coverage)
- [ ] Servicio de aplicación implementado
- [ ] Tests del servicio de aplicación con mocks
- [ ] Repositorio implementado (in-memory para tests)
- [ ] Tests de integración
- [ ] Endpoint HTTP implementado
- [ ] Manejo de errores y excepciones
- [ ] Documentación de API (comentarios/swagger)
- [ ] Código formateado (Prettier)
- [ ] Sin errores de ESLint
- [ ] Eventos de dominio emitidos correctamente

---

## 📝 Notas de Implementación

### Orden Recomendado de Desarrollo por Feature

Para cada feature, seguir este orden TDD:

1. **Escribir tests de dominio** (RED)
   - Tests de Value Objects
   - Tests de Entidad/Agregado
   - Tests de Servicios de Dominio

2. **Implementar dominio** (GREEN)
   - Value Objects
   - Entidad/Agregado
   - Servicios de Dominio

3. **Refactorizar dominio** (REFACTOR)

4. **Escribir tests de aplicación** (RED)
   - Tests del servicio de aplicación con mocks

5. **Implementar aplicación** (GREEN)
   - Servicio de aplicación
   - DTOs Request/Response

6. **Refactorizar aplicación** (REFACTOR)

7. **Escribir tests de integración** (RED)
   - Con repositorio in-memory

8. **Implementar infraestructura** (GREEN)
   - Repositorio TypeORM
   - Controller HTTP
   - Servicios externos

9. **Refactorizar infraestructura** (REFACTOR)

### Mother Objects a Crear

- `UserMother.ts`
- `EmailMother.ts`
- `UsernameMother.ts`
- `MasterPasswordHashMother.ts`
- `PasswordEntryMother.ts`
- `SiteNameMother.ts`
- `EncryptedPasswordMother.ts`
- `CategoryMother.ts`
- `TagMother.ts`

---

**Fin del documento de Features**
