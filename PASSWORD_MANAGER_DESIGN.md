# Password Manager - Diseño DDD & Arquitectura Hexagonal

Este documento define el diseño completo del Password Manager siguiendo los principios de Domain-Driven Design (DDD) y Arquitectura Hexagonal establecidos en CLAUDE.md.

---

## 📋 Tabla de Contenidos

1. [Modelo de Negocio](#-modelo-de-negocio)
2. [Bounded Contexts](#-bounded-contexts)
3. [Casos de Uso](#-casos-de-uso)
4. [Modelo de Dominio](#-modelo-de-dominio)
5. [Estructura de Proyecto](#-estructura-de-proyecto)
6. [Seguridad](#-seguridad)
7. [APIs y Endpoints](#-apis-y-endpoints)

---

## 🎯 Modelo de Negocio

### Descripción General

El Password Manager es una aplicación que permite a los usuarios almacenar de forma segura sus contraseñas, credenciales y notas relacionadas con diferentes sitios web y aplicaciones.

### Flujo Principal

1. **Registro del Usuario**
   - El usuario se registra con email y crea una Master Password
   - La Master Password se usa para encriptar todas las contraseñas del usuario
   - La Master Password NUNCA se almacena en texto plano

2. **Autenticación**
   - El usuario inicia sesión con email y Master Password
   - Se genera un token de sesión (JWT)
   - La Master Password se usa para desencriptar las contraseñas

3. **Gestión de Contraseñas**
   - El usuario puede crear, editar, eliminar y buscar entradas de contraseñas
   - Cada entrada contiene: sitio/app, username, password encriptado, notas, categoría
   - Las contraseñas se encriptan con la Master Password del usuario

4. **Recuperación de Contraseñas**
   - El usuario puede ver sus contraseñas desencriptadas previa autenticación
   - Puede copiar contraseñas al portapapeles
   - Puede generar contraseñas seguras

### Reglas de Negocio Fundamentales

- **Zero-Knowledge Architecture**: El servidor nunca conoce la Master Password ni puede desencriptar las contraseñas del usuario
- **Un usuario, una Master Password**: Cada usuario tiene una única Master Password que protege todas sus entradas
- **Encriptación del lado del cliente**: Las contraseñas se encriptan en el cliente antes de enviarse al servidor
- **Generación segura**: El sistema puede generar contraseñas seguras con diferentes criterios

---

## 🌐 Bounded Contexts

El sistema se divide en **2 Bounded Contexts principales** más el **Shared Kernel**:

### 1. Authentication Context

**Responsabilidad**: Gestionar el registro, autenticación y sesiones de usuarios.

**Conceptos del Dominio**:
- User (Usuario)
- Master Password (Contraseña Maestra)
- Session (Sesión)
- Authentication Token

**Operaciones Principales**:
- Registro de usuario
- Inicio de sesión
- Cierre de sesión
- Cambio de Master Password
- Renovación de token

---

### 2. PasswordVault Context

**Responsabilidad**: Gestionar el almacén de contraseñas encriptadas y sus metadatos.

**Conceptos del Dominio**:
- Password Entry (Entrada de Contraseña)
- Encrypted Password (Contraseña Encriptada)
- Site/Application (Sitio/Aplicación)
- Category (Categoría)
- Tag (Etiqueta)

**Operaciones Principales**:
- Crear entrada de contraseña
- Actualizar entrada
- Eliminar entrada
- Buscar/Listar entradas
- Revelar contraseña desencriptada
- Generar contraseña segura

---

### 3. Shared Context

**Responsabilidad**: Código compartido entre todos los contextos.

**Contenido**:
- AggregateRoot
- ValueObject
- DomainEvent
- Criteria/Filters
- EventBus
- Excepciones base

---

## 📝 Casos de Uso

### Authentication Context

#### 1. Register User
**Descripción**: Registrar un nuevo usuario en el sistema.

**Input**:
- Email
- Username
- Master Password

**Output**:
- UserId

**Reglas de Negocio**:
- El email debe ser único
- La Master Password debe cumplir requisitos de complejidad (mínimo 12 caracteres, mayúsculas, minúsculas, números, símbolos)
- Se genera un hash de la Master Password (bcrypt/argon2)
- Se genera un salt único para el usuario

**Eventos Generados**:
- UserRegistered

---

#### 2. Login User
**Descripción**: Autenticar usuario y crear sesión.

**Input**:
- Email
- Master Password

**Output**:
- Access Token (JWT)
- Refresh Token

**Reglas de Negocio**:
- Validar credenciales contra el hash almacenado
- Generar token JWT con expiración
- Registrar última fecha de acceso
- Limitar intentos fallidos (max 5)

**Eventos Generados**:
- UserLoggedIn

---

#### 3. Logout User
**Descripción**: Cerrar sesión del usuario.

**Input**:
- UserId
- Access Token

**Output**:
- Confirmación

**Reglas de Negocio**:
- Invalidar el token actual
- Limpiar sesión activa

**Eventos Generados**:
- UserLoggedOut

---

#### 4. Change Master Password
**Descripción**: Cambiar la Master Password del usuario.

**Input**:
- UserId
- Current Master Password
- New Master Password

**Output**:
- Confirmación

**Reglas de Negocio**:
- Validar la contraseña actual
- La nueva Master Password debe cumplir requisitos
- **IMPORTANTE**: Se deben re-encriptar TODAS las contraseñas del usuario con la nueva Master Password

**Eventos Generados**:
- MasterPasswordChanged

---

#### 5. Refresh Session
**Descripción**: Renovar el token de acceso.

**Input**:
- Refresh Token

**Output**:
- Nuevo Access Token

**Reglas de Negocio**:
- Validar refresh token
- Generar nuevo access token

---

### PasswordVault Context

#### 1. Create Password Entry
**Descripción**: Crear una nueva entrada de contraseña.

**Input**:
- UserId
- Site Name
- Site URL (opcional)
- Username
- Password (texto plano, se encripta)
- Category
- Notes (opcional)
- Tags (opcional)

**Output**:
- PasswordEntryId

**Reglas de Negocio**:
- El password se debe encriptar con AES-256 usando la Master Password
- SiteName es obligatorio
- Category tiene valores predefinidos: Personal, Work, Finance, Social, Other

**Eventos Generados**:
- PasswordEntryCreated

---

#### 2. Update Password Entry
**Descripción**: Actualizar una entrada existente.

**Input**:
- PasswordEntryId
- UserId
- Campos a actualizar (SiteName, URL, Username, Password, Category, Notes, Tags)

**Output**:
- Confirmación

**Reglas de Negocio**:
- Solo el propietario puede actualizar la entrada
- Si se cambia el password, se re-encripta
- Se actualiza la fecha de modificación

**Eventos Generados**:
- PasswordEntryUpdated

---

#### 3. Delete Password Entry
**Descripción**: Eliminar una entrada de contraseña.

**Input**:
- PasswordEntryId
- UserId

**Output**:
- Confirmación

**Reglas de Negocio**:
- Solo el propietario puede eliminar la entrada
- Eliminación permanente (no soft delete por seguridad)

**Eventos Generados**:
- PasswordEntryDeleted

---

#### 4. Find Password Entry
**Descripción**: Buscar una entrada específica por ID.

**Input**:
- PasswordEntryId
- UserId

**Output**:
- PasswordEntry (con password encriptado)

**Reglas de Negocio**:
- Solo el propietario puede ver la entrada
- El password se retorna encriptado

---

#### 5. List Password Entries
**Descripción**: Listar todas las entradas del usuario.

**Input**:
- UserId
- Paginación (offset, limit)
- Ordenamiento (campo, dirección)

**Output**:
- Lista de PasswordEntries (con passwords encriptados)

**Reglas de Negocio**:
- Solo retornar entradas del usuario autenticado
- Soportar ordenamiento por nombre, fecha creación, categoría

---

#### 6. Search Password Entries
**Descripción**: Buscar entradas por criterios.

**Input**:
- UserId
- Criterios (site name, category, tags, username)

**Output**:
- Lista de PasswordEntries coincidentes

**Reglas de Negocio**:
- Búsqueda case-insensitive
- Soportar búsqueda por múltiples criterios

---

#### 7. Reveal Password
**Descripción**: Desencriptar y revelar un password.

**Input**:
- PasswordEntryId
- UserId
- Master Password (para desencriptar)

**Output**:
- Password en texto plano

**Reglas de Negocio**:
- Validar Master Password
- Solo el propietario puede revelar
- Registrar evento de acceso (auditoría)

**Eventos Generados**:
- PasswordRevealed

---

#### 8. Generate Secure Password
**Descripción**: Generar una contraseña segura.

**Input**:
- Length (longitud, default: 16)
- Include Uppercase (default: true)
- Include Lowercase (default: true)
- Include Numbers (default: true)
- Include Symbols (default: true)
- Exclude Ambiguous Characters (default: true)

**Output**:
- Generated Password

**Reglas de Negocio**:
- Longitud mínima: 8 caracteres
- Longitud máxima: 128 caracteres
- Al menos un tipo de carácter debe estar incluido

---

## 🏗️ Modelo de Dominio

### Authentication Context

#### Entidades

**User** (Raíz de Agregado)
```typescript
class User extends AggregateRoot {
  private readonly _id: UserId;
  private _email: Email;
  private _username: Username;
  private _masterPasswordHash: MasterPasswordHash;
  private _salt: string;
  private _isActive: boolean;
  private _lastLoginAt: Date | null;
  private _failedLoginAttempts: number;
  private _createdAt: Date;
  private _updatedAt: Date;

  // Métodos de negocio
  authenticate(masterPassword: string): boolean
  lockAccount(): void
  unlockAccount(): void
  resetFailedAttempts(): void
  changeMasterPassword(currentPassword: string, newPassword: string): void
  recordLogin(): void
}
```

#### Value Objects

**UserId**
```typescript
class UserId extends ValueObject<string> {
  static generate(): UserId
}
```

**Email**
```typescript
class Email extends ValueObject<string> {
  validate(): void
  get domain(): string
}
```

**Username**
```typescript
class Username extends ValueObject<string> {
  validate(): void // min 3, max 50 caracteres
}
```

**MasterPasswordHash**
```typescript
class MasterPasswordHash extends ValueObject<string> {
  static fromPlainPassword(password: string, salt: string): MasterPasswordHash
  verify(plainPassword: string, salt: string): boolean
}
```

**SessionToken**
```typescript
class SessionToken extends ValueObject<string> {
  static generate(userId: UserId, expiresIn: number): SessionToken
  isExpired(): boolean
}
```

#### Repositorios (Puertos)

```typescript
interface UserRepository {
  save(user: User): Promise<void>;
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  findByUsername(username: Username): Promise<User | null>;
  delete(id: UserId): Promise<void>;
}
```

#### Servicios de Dominio

```typescript
class MasterPasswordHashingService {
  hash(password: string, salt: string): string
  verify(password: string, hash: string, salt: string): boolean
  generateSalt(): string
}
```

#### Eventos de Dominio

```typescript
class UserRegistered extends BaseDomainEvent {
  constructor(
    readonly userId: string,
    readonly email: string,
    readonly username: string
  )
}

class UserLoggedIn extends BaseDomainEvent {
  constructor(
    readonly userId: string,
    readonly loginAt: Date
  )
}

class UserLoggedOut extends BaseDomainEvent {
  constructor(readonly userId: string)
}

class MasterPasswordChanged extends BaseDomainEvent {
  constructor(
    readonly userId: string,
    readonly changedAt: Date
  )
}
```

---

### PasswordVault Context

#### Entidades

**PasswordEntry** (Raíz de Agregado)
```typescript
class PasswordEntry extends AggregateRoot {
  private readonly _id: PasswordEntryId;
  private readonly _userId: UserId; // Referencia al propietario
  private _siteName: SiteName;
  private _siteUrl: SiteUrl | null;
  private _username: Username;
  private _encryptedPassword: EncryptedPassword;
  private _category: Category;
  private _notes: Notes | null;
  private _tags: Tag[];
  private _createdAt: Date;
  private _updatedAt: Date;
  private _lastAccessedAt: Date | null;

  // Métodos de negocio
  updateSiteName(siteName: SiteName): void
  updateCredentials(username: Username, encryptedPassword: EncryptedPassword): void
  updateCategory(category: Category): void
  updateNotes(notes: Notes): void
  addTag(tag: Tag): void
  removeTag(tag: Tag): void
  recordAccess(): void
  belongsToUser(userId: UserId): boolean
}
```

#### Value Objects

**PasswordEntryId**
```typescript
class PasswordEntryId extends ValueObject<string> {
  static generate(): PasswordEntryId
}
```

**SiteName**
```typescript
class SiteName extends ValueObject<string> {
  validate(): void // no vacío, max 100 caracteres
}
```

**SiteUrl**
```typescript
class SiteUrl extends ValueObject<string> {
  validate(): void // formato URL válido
  get domain(): string
}
```

**Username**
```typescript
class Username extends ValueObject<string> {
  validate(): void
}
```

**EncryptedPassword**
```typescript
class EncryptedPassword extends ValueObject<string> {
  static encrypt(plainPassword: string, masterPassword: string): EncryptedPassword
  decrypt(masterPassword: string): string
  get encryptedValue(): string
}
```

**Category**
```typescript
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
  static finance(): Category
  // ... otros factory methods
}
```

**Notes**
```typescript
class Notes extends ValueObject<string> {
  validate(): void // max 1000 caracteres
}
```

**Tag**
```typescript
class Tag extends ValueObject<string> {
  validate(): void // lowercase, max 30 caracteres, sin espacios
}
```

#### Repositorios (Puertos)

```typescript
interface PasswordEntryRepository {
  save(entry: PasswordEntry): Promise<void>;
  findById(id: PasswordEntryId): Promise<PasswordEntry | null>;
  findByUserId(userId: UserId): Promise<PasswordEntry[]>;
  findByUserIdAndCriteria(userId: UserId, criteria: Criteria): Promise<PasswordEntry[]>;
  delete(id: PasswordEntryId): Promise<void>;
  deleteAllByUserId(userId: UserId): Promise<void>;
}
```

#### Servicios de Dominio

```typescript
class PasswordEncryptionService {
  encrypt(plainPassword: string, masterPassword: string): string
  decrypt(encryptedPassword: string, masterPassword: string): string
}

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

#### Eventos de Dominio

```typescript
class PasswordEntryCreated extends BaseDomainEvent {
  constructor(
    readonly entryId: string,
    readonly userId: string,
    readonly siteName: string
  )
}

class PasswordEntryUpdated extends BaseDomainEvent {
  constructor(
    readonly entryId: string,
    readonly userId: string,
    readonly updatedFields: string[]
  )
}

class PasswordEntryDeleted extends BaseDomainEvent {
  constructor(
    readonly entryId: string,
    readonly userId: string
  )
}

class PasswordRevealed extends BaseDomainEvent {
  constructor(
    readonly entryId: string,
    readonly userId: string,
    readonly revealedAt: Date
  )
}
```

---

## 📁 Estructura de Proyecto

```
password-manager/
├── src/
│   ├── Contexts/
│   │   │
│   │   ├── Authentication/
│   │   │   └── Users/
│   │   │       ├── domain/
│   │   │       │   ├── User.ts
│   │   │       │   ├── UserId.ts
│   │   │       │   ├── Email.ts
│   │   │       │   ├── Username.ts
│   │   │       │   ├── MasterPasswordHash.ts
│   │   │       │   ├── SessionToken.ts
│   │   │       │   ├── UserRepository.ts
│   │   │       │   ├── MasterPasswordHashingService.ts
│   │   │       │   └── events/
│   │   │       │       ├── UserRegistered.ts
│   │   │       │       ├── UserLoggedIn.ts
│   │   │       │       ├── UserLoggedOut.ts
│   │   │       │       └── MasterPasswordChanged.ts
│   │   │       │
│   │   │       ├── application/
│   │   │       │   ├── Register/
│   │   │       │   │   ├── UserRegistrar.ts
│   │   │       │   │   ├── RegisterUserRequest.ts
│   │   │       │   │   └── RegisterUserResponse.ts
│   │   │       │   ├── Login/
│   │   │       │   │   ├── UserAuthenticator.ts
│   │   │       │   │   ├── LoginRequest.ts
│   │   │       │   │   └── LoginResponse.ts
│   │   │       │   ├── Logout/
│   │   │       │   │   ├── UserLogout.ts
│   │   │       │   │   └── LogoutRequest.ts
│   │   │       │   ├── ChangePassword/
│   │   │       │   │   ├── MasterPasswordChanger.ts
│   │   │       │   │   └── ChangePasswordRequest.ts
│   │   │       │   └── RefreshSession/
│   │   │       │       ├── SessionRefresher.ts
│   │   │       │       ├── RefreshSessionRequest.ts
│   │   │       │       └── RefreshSessionResponse.ts
│   │   │       │
│   │   │       └── infrastructure/
│   │   │           ├── persistence/
│   │   │           │   ├── TypeOrmUserRepository.ts
│   │   │           │   └── UserModel.ts
│   │   │           ├── http/
│   │   │           │   └── AuthController.ts
│   │   │           └── services/
│   │   │               ├── BcryptPasswordHashingService.ts
│   │   │               └── JwtTokenService.ts
│   │   │
│   │   ├── PasswordVault/
│   │   │   └── Passwords/
│   │   │       ├── domain/
│   │   │       │   ├── PasswordEntry.ts
│   │   │       │   ├── PasswordEntryId.ts
│   │   │       │   ├── SiteName.ts
│   │   │       │   ├── SiteUrl.ts
│   │   │       │   ├── Username.ts
│   │   │       │   ├── EncryptedPassword.ts
│   │   │       │   ├── Category.ts
│   │   │       │   ├── Notes.ts
│   │   │       │   ├── Tag.ts
│   │   │       │   ├── PasswordEntryRepository.ts
│   │   │       │   ├── PasswordEncryptionService.ts
│   │   │       │   ├── PasswordGeneratorService.ts
│   │   │       │   └── events/
│   │   │       │       ├── PasswordEntryCreated.ts
│   │   │       │       ├── PasswordEntryUpdated.ts
│   │   │       │       ├── PasswordEntryDeleted.ts
│   │   │       │       └── PasswordRevealed.ts
│   │   │       │
│   │   │       ├── application/
│   │   │       │   ├── Create/
│   │   │       │   │   ├── PasswordEntryCreator.ts
│   │   │       │   │   ├── CreatePasswordEntryRequest.ts
│   │   │       │   │   └── CreatePasswordEntryResponse.ts
│   │   │       │   ├── Update/
│   │   │       │   │   ├── PasswordEntryUpdater.ts
│   │   │       │   │   └── UpdatePasswordEntryRequest.ts
│   │   │       │   ├── Delete/
│   │   │       │   │   ├── PasswordEntryDeleter.ts
│   │   │       │   │   └── DeletePasswordEntryRequest.ts
│   │   │       │   ├── Find/
│   │   │       │   │   ├── PasswordEntryFinder.ts
│   │   │       │   │   ├── FindPasswordEntryRequest.ts
│   │   │       │   │   └── PasswordEntryResponse.ts
│   │   │       │   ├── List/
│   │   │       │   │   ├── PasswordEntriesLister.ts
│   │   │       │   │   ├── ListPasswordEntriesRequest.ts
│   │   │       │   │   └── PasswordEntriesResponse.ts
│   │   │       │   ├── Search/
│   │   │       │   │   ├── PasswordEntriesSearcher.ts
│   │   │       │   │   └── SearchPasswordEntriesRequest.ts
│   │   │       │   ├── Reveal/
│   │   │       │   │   ├── PasswordRevealer.ts
│   │   │       │   │   ├── RevealPasswordRequest.ts
│   │   │       │   │   └── RevealPasswordResponse.ts
│   │   │       │   └── Generate/
│   │   │       │       ├── SecurePasswordGenerator.ts
│   │   │       │       ├── GeneratePasswordRequest.ts
│   │   │       │       └── GeneratePasswordResponse.ts
│   │   │       │
│   │   │       └── infrastructure/
│   │   │           ├── persistence/
│   │   │           │   ├── TypeOrmPasswordEntryRepository.ts
│   │   │           │   └── PasswordEntryModel.ts
│   │   │           ├── http/
│   │   │           │   └── PasswordVaultController.ts
│   │   │           └── services/
│   │   │               ├── AesPasswordEncryptionService.ts
│   │   │               └── CryptoPasswordGeneratorService.ts
│   │   │
│   │   └── Shared/
│   │       ├── domain/
│   │       │   ├── AggregateRoot.ts
│   │       │   ├── ValueObject.ts
│   │       │   ├── DomainEvent.ts
│   │       │   ├── DomainException.ts
│   │       │   └── criteria/
│   │       │       ├── Criteria.ts
│   │       │       ├── Filters.ts
│   │       │       └── Order.ts
│   │       │
│   │       └── infrastructure/
│   │           ├── persistence/
│   │           │   └── typeorm/
│   │           │       └── TypeOrmConfig.ts
│   │           └── EventBus.ts
│   │
│   └── apps/
│       └── api/
│           ├── server.ts
│           ├── routes/
│           │   ├── auth.routes.ts
│           │   └── passwords.routes.ts
│           ├── middleware/
│           │   ├── authentication.middleware.ts
│           │   └── errorHandler.middleware.ts
│           └── dependency-injection.ts
│
└── tests/
    ├── Contexts/
    │   ├── Authentication/
    │   │   └── Users/
    │   │       ├── domain/
    │   │       │   ├── User.test.ts
    │   │       │   └── MasterPasswordHash.test.ts
    │   │       └── application/
    │   │           ├── Register/
    │   │           │   └── UserRegistrar.test.ts
    │   │           └── Login/
    │   │               └── UserAuthenticator.test.ts
    │   │
    │   └── PasswordVault/
    │       └── Passwords/
    │           ├── domain/
    │           │   ├── PasswordEntry.test.ts
    │           │   └── EncryptedPassword.test.ts
    │           └── application/
    │               ├── Create/
    │               │   └── PasswordEntryCreator.test.ts
    │               └── Reveal/
    │                   └── PasswordRevealer.test.ts
    │
    └── mothers/
        ├── UserMother.ts
        ├── EmailMother.ts
        ├── PasswordEntryMother.ts
        ├── SiteNameMother.ts
        └── EncryptedPasswordMother.ts
```

---

## 🔐 Seguridad

### Arquitectura Zero-Knowledge

El sistema implementa una arquitectura **Zero-Knowledge**, lo que significa:

1. **El servidor nunca conoce la Master Password**
   - Solo se almacena el hash de la Master Password
   - Se usa bcrypt o argon2 con salt único por usuario

2. **El servidor nunca puede desencriptar las contraseñas**
   - Las contraseñas se encriptan en el cliente
   - La clave de encriptación deriva de la Master Password
   - El servidor solo almacena datos encriptados

### Encriptación de Contraseñas

**Algoritmo**: AES-256-GCM (Galois/Counter Mode)

**Proceso de Encriptación**:
1. Derivar clave de encriptación desde Master Password usando PBKDF2
2. Generar IV (Initialization Vector) aleatorio
3. Encriptar password con AES-256-GCM
4. Almacenar: `iv:encryptedData:authTag`

**Proceso de Desencriptación**:
1. Verificar la Master Password del usuario
2. Derivar la misma clave de encriptación
3. Extraer IV y datos encriptados
4. Desencriptar con AES-256-GCM

### Hashing de Master Password

**Algoritmo**: bcrypt (factor de trabajo: 12) o argon2id

**Proceso**:
1. Generar salt único de 16 bytes
2. Aplicar bcrypt/argon2 con el salt
3. Almacenar hash y salt en la BD

### Validación de Master Password

**Requisitos**:
- Longitud mínima: 12 caracteres
- Al menos 1 mayúscula
- Al menos 1 minúscula
- Al menos 1 número
- Al menos 1 símbolo especial
- No debe contener información personal obvia

### Protección contra Ataques

1. **Fuerza Bruta**
   - Límite de 5 intentos fallidos de login
   - Bloqueo temporal de cuenta tras 5 fallos
   - Rate limiting en endpoints de autenticación

2. **CSRF**
   - Tokens CSRF en todas las peticiones de modificación
   - SameSite cookies

3. **XSS**
   - Sanitización de inputs
   - Content Security Policy headers

4. **SQL Injection**
   - Uso de ORM (TypeORM) con queries parametrizadas
   - Validación de inputs en Value Objects

### Tokens de Sesión

**Tipo**: JWT (JSON Web Tokens)

**Contenido del Access Token**:
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "iat": 1234567890,
  "exp": 1234571490
}
```

**Duración**:
- Access Token: 15 minutos
- Refresh Token: 7 días

**Almacenamiento**:
- Access Token: HttpOnly cookie o localStorage (si es app web)
- Refresh Token: HttpOnly cookie

---

## 🌐 APIs y Endpoints

### Authentication Endpoints

#### POST /api/auth/register
Registrar nuevo usuario

**Request**:
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "masterPassword": "SecureP@ssw0rd123!"
}
```

**Response** (201 Created):
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "username": "johndoe"
}
```

---

#### POST /api/auth/login
Iniciar sesión

**Request**:
```json
{
  "email": "user@example.com",
  "masterPassword": "SecureP@ssw0rd123!"
}
```

**Response** (200 OK):
```json
{
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token",
  "expiresIn": 900
}
```

---

#### POST /api/auth/logout
Cerrar sesión

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Response** (204 No Content)

---

#### POST /api/auth/refresh
Renovar token de acceso

**Request**:
```json
{
  "refreshToken": "refresh-token"
}
```

**Response** (200 OK):
```json
{
  "accessToken": "new-jwt-token",
  "expiresIn": 900
}
```

---

#### PUT /api/auth/password
Cambiar Master Password

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Request**:
```json
{
  "currentPassword": "OldP@ssw0rd123!",
  "newPassword": "NewP@ssw0rd456!"
}
```

**Response** (204 No Content)

---

### Password Vault Endpoints

#### POST /api/passwords
Crear nueva entrada de contraseña

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Request**:
```json
{
  "siteName": "GitHub",
  "siteUrl": "https://github.com",
  "username": "johndoe",
  "password": "plaintextPassword123",
  "category": "WORK",
  "notes": "Personal GitHub account",
  "tags": ["development", "code"]
}
```

**Response** (201 Created):
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

---

#### GET /api/passwords
Listar todas las entradas

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Query Parameters**:
- `page` (default: 1)
- `limit` (default: 20)
- `sortBy` (default: "siteName")
- `sortOrder` (default: "asc")

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": "entry-uuid",
      "siteName": "GitHub",
      "siteUrl": "https://github.com",
      "username": "johndoe",
      "category": "WORK",
      "tags": ["development", "code"],
      "createdAt": "2025-01-15T10:30:00Z",
      "updatedAt": "2025-01-15T10:30:00Z"
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

---

#### GET /api/passwords/:id
Obtener entrada específica

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Response** (200 OK):
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
  "updatedAt": "2025-01-15T10:30:00Z",
  "lastAccessedAt": "2025-01-16T14:20:00Z"
}
```

---

#### POST /api/passwords/:id/reveal
Revelar contraseña desencriptada

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Request**:
```json
{
  "masterPassword": "SecureP@ssw0rd123!"
}
```

**Response** (200 OK):
```json
{
  "password": "plaintextPassword123"
}
```

---

#### PUT /api/passwords/:id
Actualizar entrada

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Request**:
```json
{
  "siteName": "GitHub Enterprise",
  "username": "john.doe",
  "password": "newPassword456",
  "notes": "Work GitHub account"
}
```

**Response** (200 OK):
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

---

#### DELETE /api/passwords/:id
Eliminar entrada

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Response** (204 No Content)

---

#### GET /api/passwords/search
Buscar entradas

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Query Parameters**:
- `q` (término de búsqueda)
- `category` (filtrar por categoría)
- `tags` (filtrar por tags, comma-separated)

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": "entry-uuid",
      "siteName": "GitHub",
      "username": "johndoe",
      "category": "WORK",
      "tags": ["development"]
    }
  ],
  "count": 1
}
```

---

#### POST /api/passwords/generate
Generar contraseña segura

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Request**:
```json
{
  "length": 16,
  "includeUppercase": true,
  "includeLowercase": true,
  "includeNumbers": true,
  "includeSymbols": true,
  "excludeAmbiguous": true
}
```

**Response** (200 OK):
```json
{
  "password": "Kx9#mP2$vL8@qR5!"
}
```

---

## 📊 Excepciones de Dominio

### Authentication Context

```typescript
// Shared/domain/exceptions/DomainException.ts
export abstract class DomainException extends Error {}

// Authentication/Users/domain/exceptions/
export class InvalidEmailException extends DomainException {}
export class InvalidMasterPasswordException extends DomainException {}
export class UserAlreadyExistsException extends DomainException {}
export class UserNotFoundException extends DomainException {}
export class InvalidCredentialsException extends DomainException {}
export class AccountLockedException extends DomainException {}
export class InvalidTokenException extends DomainException {}
```

### PasswordVault Context

```typescript
// PasswordVault/Passwords/domain/exceptions/
export class InvalidSiteNameException extends DomainException {}
export class InvalidSiteUrlException extends DomainException {}
export class PasswordEntryNotFoundException extends DomainException {}
export class UnauthorizedAccessException extends DomainException {}
export class EncryptionException extends DomainException {}
export class DecryptionException extends DomainException {}
export class InvalidPasswordGenerationOptionsException extends DomainException {}
```

---

## 🎯 Próximos Pasos

1. **Configuración del Proyecto**
   - Inicializar proyecto TypeScript
   - Configurar TypeORM
   - Configurar ESLint y Prettier
   - Configurar Jest para testing

2. **Implementación del Shared Kernel**
   - AggregateRoot
   - ValueObject base
   - DomainEvent base
   - Criteria/Filters

3. **Implementación del Authentication Context**
   - Modelo de dominio
   - Casos de uso
   - Adaptadores de persistencia
   - Endpoints HTTP

4. **Implementación del PasswordVault Context**
   - Modelo de dominio
   - Casos de uso
   - Servicios de encriptación
   - Endpoints HTTP

5. **Testing**
   - Tests unitarios de dominio
   - Tests de servicios de aplicación
   - Tests de integración
   - Mother Objects

6. **Seguridad**
   - Implementar encriptación AES-256
   - Implementar hashing con bcrypt/argon2
   - Configurar CORS y CSP
   - Rate limiting

7. **Documentación**
   - API documentation (OpenAPI/Swagger)
   - Guía de instalación
   - Guía de uso

---

**Nota**: Este diseño sigue estrictamente los principios establecidos en CLAUDE.md y está listo para ser implementado usando TDD, DDD y Arquitectura Hexagonal.
