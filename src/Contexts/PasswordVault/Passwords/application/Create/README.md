# Create Password Entry - Application Layer

## Overview

Este módulo implementa el caso de uso **Create Password Entry** siguiendo los principios de **Domain-Driven Design (DDD)** y **Arquitectura Hexagonal**.

## Componentes

### 1. DTOs (Data Transfer Objects)

#### `CreatePasswordEntryRequest`
- **Propósito**: Transferir datos desde la capa de infraestructura (controller) a la capa de aplicación
- **Contiene**: Solo primitivos (strings, arrays)
- **Campos obligatorios**: `userId`, `siteName`, `username`, `password`, `category`
- **Campos opcionales**: `siteUrl`, `notes`, `tags`

#### `CreatePasswordEntryResponse`
- **Propósito**: Retornar datos desde la aplicación hacia la infraestructura
- **Nota importante**: NO incluye la contraseña por seguridad
- **Campos**: Todos los datos del entry creado excepto el password

### 2. Application Service

#### `PasswordEntryCreator`
- **Responsabilidad**: Orquestar la creación de un password entry
- **NO contiene lógica de negocio** (esa está en el dominio)

**Flujo de orquestación:**
1. Recibe `CreatePasswordEntryRequest` con primitivos
2. Convierte primitivos a Value Objects (validación ocurre aquí)
3. Encripta la contraseña usando `PasswordEncryptionService` port
4. Delega la creación al método factory `PasswordEntry.create()`
5. Persiste usando `PasswordEntryRepository` port
6. Mapea el aggregate a `CreatePasswordEntryResponse`

**Dependencias (inyectadas via constructor):**
- `PasswordEntryRepository`: Puerto para persistencia
- `PasswordEncryptionService`: Puerto para encriptación

## Principios Aplicados

### Arquitectura Hexagonal
- **Puertos**: El servicio depende de interfaces (ports), no de implementaciones
- **Dirección de dependencias**: Application → Domain (nunca al revés)
- **Sin dependencias de infraestructura**: No conoce detalles de BD, frameworks, etc.

### Domain-Driven Design
- **Orchestration Only**: El servicio solo coordina, no ejecuta lógica de negocio
- **Value Objects**: Toda validación de datos ocurre en los VOs del dominio
- **Factory Pattern**: Usa `PasswordEntry.create()` para instanciar el aggregate
- **DTOs**: Separación clara entre datos de transporte y modelo de dominio

### Separación de Responsabilidades
- **Validación**: En los Value Objects del dominio
- **Lógica de negocio**: En el aggregate `PasswordEntry`
- **Orquestación**: En `PasswordEntryCreator`
- **Persistencia**: En la implementación del repositorio (infrastructure layer)
- **Encriptación**: En la implementación del servicio (infrastructure layer)

## Testing

### Tests Unitarios
Ubicación: `/tests/Contexts/PasswordVault/Passwords/application/Create/PasswordEntryCreator.test.ts`

**Cobertura: 31/32 tests (96.87%)**

**Categorías de tests:**
1. **Success Cases** (15 tests): Creación exitosa con diferentes combinaciones de datos
2. **Validation Error Cases** (9 tests): Validaciones de Value Objects
3. **Business Rules** (5 tests): Reglas de negocio del dominio
4. **Integration with Ports** (2 tests): Interacción con dependencias

### Mocks
Los tests usan mocks de los puertos:
- `MockPasswordEntryRepository`: Implementación en memoria para tests
- `MockPasswordEncryptionService`: Retorna passwords encriptados válidos

### Mother Objects
- `CreatePasswordEntryRequestMother`: Factory para requests de test
- `CreatePasswordEntryResponseMother`: Factory para responses de test

## Uso

```typescript
import {
  PasswordEntryCreator,
  CreatePasswordEntryRequest
} from '@/Contexts/PasswordVault/Passwords/application/Create';

// Inyectar dependencias
const creator = new PasswordEntryCreator(
  passwordEntryRepository,
  passwordEncryptionService
);

// Ejecutar caso de uso
const request: CreatePasswordEntryRequest = {
  userId: 'user-123',
  siteName: 'GitHub',
  siteUrl: 'https://github.com',
  username: 'developer',
  password: 'MySecurePassword123!', // Plain text - será encriptado
  category: 'WORK',
  notes: 'My development account',
  tags: ['work', 'development']
};

const response = await creator.run(request);

console.log(response.id); // UUID del entry creado
console.log(response.siteName); // 'GitHub'
// Note: response NO incluye el password
```

## Validaciones

Las validaciones son manejadas por los Value Objects del dominio:

| Campo | Validación | Excepción |
|-------|-----------|-----------|
| `siteName` | No vacío, máx 100 chars | `InvalidSiteNameException` |
| `siteUrl` | URL válida con http/https | `InvalidSiteUrlException` |
| `username` | No vacío | `InvalidUsernameException` |
| `category` | Enum válido (PERSONAL, WORK, etc.) | `InvalidCategoryException` |
| `notes` | Máximo 1000 caracteres | `InvalidNotesException` |
| `tags` | No vacío, máx 30 chars, sin espacios | `InvalidTagException` |

## Seguridad

1. **Password nunca en Response**: Por seguridad, el password NO se incluye en el response
2. **Encriptación**: El password se encripta antes de persistir usando AES-256-GCM
3. **Validación**: Todas las entradas son validadas por los Value Objects
4. **Ownership**: El entry siempre se asocia al `userId` proporcionado

## Próximos Pasos

Para completar la feature F7, falta implementar:

1. **Infrastructure Layer**:
   - Controller HTTP (POST /password-entries)
   - TypeORM/MongoDB Repository implementation
   - Password Encryption Service implementation

2. **Integration Tests**:
   - Tests end-to-end con base de datos real
   - Tests del controller

## Referencias

- Domain Layer: `/src/Contexts/PasswordVault/Passwords/domain/`
- Tests: `/tests/Contexts/PasswordVault/Passwords/application/Create/`
- CLAUDE.md: Guía de arquitectura del proyecto
