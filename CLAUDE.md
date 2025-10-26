# TypeScript Backend Coding Rules

Guía de estándares de codificación para servicios backend en TypeScript siguiendo Domain-Driven Design (DDD) y Arquitectura Hexagonal de manera simplificada.

---

## 🎯 Filosofía del Proyecto

Este documento establece reglas y patrones para construir servicios backend mantenibles, testables y escalables usando:

- **Domain-Driven Design (DDD)**: Modelos de dominio ricos, lenguaje ubicuo, límites claros
- **Arquitectura Hexagonal (Puertos y Adaptadores)**: Separación de responsabilidades, testeabilidad, independencia tecnológica
- **Test-Driven Development (TDD)**: Tests primero, desarrollo guiado por pruebas
- **Mother Object Pattern**: Creación de datos de prueba consistentes y mantenibles

---

## 📁 Estructura de Proyecto

La estructura está organizada por **Bounded Contexts** (contextos delimitados), que representan diferentes subdominios del negocio.

```
src/
├── Contexts/                      # Bounded Contexts del sistema
│   │
│   ├── UserManagement/           # Contexto de Gestión de Usuarios
│   │   ├── Users/                # Módulo de Usuarios
│   │   │   ├── domain/
│   │   │   │   ├── User.ts                    # Entidad
│   │   │   │   ├── Email.ts                   # Value Object
│   │   │   │   ├── UserId.ts                  # Value Object
│   │   │   │   ├── UserRepository.ts          # Puerto (interfaz)
│   │   │   │   └── UserEmailChanged.ts        # Evento de dominio
│   │   │   │
│   │   │   ├── application/
│   │   │   │   ├── Create/
│   │   │   │   │   ├── UserCreator.ts         # Servicio de aplicación
│   │   │   │   │   └── CreateUserRequest.ts   # DTO de entrada
│   │   │   │   ├── ChangeEmail/
│   │   │   │   │   ├── UserEmailChanger.ts
│   │   │   │   │   └── ChangeEmailRequest.ts
│   │   │   │   └── Find/
│   │   │   │       ├── UserFinder.ts
│   │   │   │       ├── FindUserRequest.ts
│   │   │   │       └── UserResponse.ts        # DTO de salida
│   │   │   │
│   │   │   └── infrastructure/
│   │   │       ├── persistence/
│   │   │       │   └── TypeOrmUserRepository.ts
│   │   │       └── http/
│   │   │           └── UserController.ts      # Adaptador primario
│   │   │
│   │   └── Profiles/             # Otro módulo del mismo contexto
│   │       ├── domain/
│   │       ├── application/
│   │       └── infrastructure/
│   │
│   ├── Sales/                    # Contexto de Ventas
│   │   ├── Orders/
│   │   │   ├── domain/
│   │   │   │   ├── Order.ts
│   │   │   │   ├── OrderId.ts
│   │   │   │   ├── OrderLineItem.ts
│   │   │   │   ├── OrderStatus.ts
│   │   │   │   └── OrderRepository.ts
│   │   │   │
│   │   │   ├── application/
│   │   │   │   ├── Create/
│   │   │   │   │   └── OrderCreator.ts
│   │   │   │   ├── Confirm/
│   │   │   │   │   └── OrderConfirmer.ts
│   │   │   │   └── Find/
│   │   │   │       └── OrderFinder.ts
│   │   │   │
│   │   │   └── infrastructure/
│   │   │       └── persistence/
│   │   │           └── TypeOrmOrderRepository.ts
│   │   │
│   │   └── Products/
│   │       ├── domain/
│   │       ├── application/
│   │       └── infrastructure/
│   │
│   └── Shared/                   # Contexto compartido (Shared Kernel)
│       ├── domain/
│       │   ├── AggregateRoot.ts           # Clase base para agregados
│       │   ├── DomainEvent.ts             # Clase base para eventos
│       │   ├── ValueObject.ts             # Clase base para VOs
│       │   └── criteria/                  # Patrón Specification
│       │       ├── Criteria.ts
│       │       ├── Filters.ts
│       │       └── Order.ts
│       │
│       └── infrastructure/
│           ├── persistence/
│           │   └── typeorm/
│           │       └── TypeOrmConfig.ts
│           └── EventBus.ts
│
├── apps/                         # Puntos de entrada de la aplicación
│   ├── api/                      # API REST
│   │   ├── server.ts
│   │   ├── routes/
│   │   │   ├── users.routes.ts
│   │   │   └── orders.routes.ts
│   │   └── dependency-injection.ts
│   │
│   └── cli/                      # CLI (si aplica)
│       └── commands/
│
└── tests/                        # Tests (estructura paralela a Contexts/)
    ├── Contexts/
    │   ├── UserManagement/
    │   │   └── Users/
    │   │       ├── domain/
    │   │       │   └── User.test.ts
    │   │       └── application/
    │   │           └── Create/
    │   │               └── UserCreator.test.ts
    │   └── Sales/
    │
    └── mothers/                  # Mother Objects para tests
        ├── UserMother.ts
        ├── EmailMother.ts
        └── OrderMother.ts
```

### 📐 Principios de la Estructura

**Bounded Contexts (Contextos Delimitados):**
- Cada contexto representa un subdominio del negocio
- Los contextos son independientes entre sí
- Pueden tener su propia base de datos
- La comunicación entre contextos es explícita (eventos, APIs)

**Módulos dentro de Contextos:**
- Cada módulo representa un agregado o concepto del negocio
- Sigue la estructura: domain → application → infrastructure
- La comunicación entre módulos del mismo contexto es directa

**Shared (Kernel Compartido):**
- Código compartido entre todos los contextos
- Clases base, utilidades, infraestructura común
- Debe mantenerse al mínimo y ser estable

---

## 🏛️ Reglas del Modelo de Dominio

### 1. Entidades (Entities)

Las entidades son objetos con identidad única que persiste a lo largo de su ciclo de vida.

**Reglas:**
- DEBE tener una identidad única que no cambie
- DEBE contener lógica de negocio, no solo datos (evitar modelos anémicos)
- La identidad es inmutable una vez asignada
- Implementar igualdad basada en identidad, no en atributos
- NO debe tener lógica de infraestructura

**Ejemplo:**

```typescript
// domain/model/user/User.ts
import { Email } from './Email';
import { UserId } from './UserId';
import { UserEmailChanged } from '../../events/UserEmailChanged';

export class User {
  private readonly _id: UserId;
  private _email: Email;
  private _name: string;
  private _isActive: boolean;
  private _domainEvents: UserEmailChanged[] = [];

  constructor(id: UserId, email: Email, name: string, isActive: boolean = true) {
    this._id = id;
    this._email = email;
    this._name = name;
    this._isActive = isActive;
  }

  // Factory method
  static create(email: Email, name: string): User {
    const userId = UserId.generate();
    return new User(userId, email, name);
  }

  // Lógica de negocio
  changeEmail(newEmail: Email): void {
    if (!this._isActive) {
      throw new Error('Cannot change email of inactive user');
    }

    const oldEmail = this._email;
    this._email = newEmail;

    // Registrar evento de dominio
    this._domainEvents.push(
      new UserEmailChanged(this._id, oldEmail, newEmail, new Date())
    );
  }

  deactivate(): void {
    if (!this._isActive) {
      throw new Error('User is already inactive');
    }
    this._isActive = false;
  }

  // Getters
  get id(): UserId {
    return this._id;
  }

  get email(): Email {
    return this._email;
  }

  get name(): string {
    return this._name;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get domainEvents(): UserEmailChanged[] {
    return [...this._domainEvents];
  }

  clearDomainEvents(): void {
    this._domainEvents = [];
  }

  // Igualdad basada en identidad
  equals(other: User): boolean {
    if (!(other instanceof User)) return false;
    return this._id.equals(other._id);
  }
}
```

---

### 2. Value Objects

Los Value Objects son objetos inmutables que se identifican por sus atributos, no por identidad.

**Reglas:**
- DEBE ser inmutable (usar `readonly` en todas las propiedades)
- La igualdad se basa en TODOS los atributos
- DEBE incluir validación en el constructor
- DEBE tener métodos significativos que operen sobre el valor
- Representan conceptos del dominio

**Ejemplo:**

```typescript
// domain/model/user/Email.ts
export class Email {
  private readonly _value: string;

  constructor(value: string) {
    this.validate(value);
    this._value = value.toLowerCase().trim();
  }

  private validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('Email cannot be empty');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new Error(`Invalid email format: ${value}`);
    }
  }

  get value(): string {
    return this._value;
  }

  get domain(): string {
    return this._value.split('@')[1];
  }

  equals(other: Email): boolean {
    if (!(other instanceof Email)) return false;
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
```

```typescript
// domain/model/user/UserId.ts
import { randomUUID } from 'crypto';

export class UserId {
  private readonly _value: string;

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('UserId cannot be empty');
    }
    this._value = value;
  }

  static generate(): UserId {
    return new UserId(randomUUID());
  }

  get value(): string {
    return this._value;
  }

  equals(other: UserId): boolean {
    if (!(other instanceof UserId)) return false;
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
```

---

### 3. Agregados (Aggregates)

Los agregados son grupos de entidades y value objects tratados como una unidad.

**Reglas:**
- DEBE tener una única Raíz de Agregado (Aggregate Root)
- Solo la Raíz del Agregado debe ser accesible desde el exterior
- Los límites del agregado deben alinearse con límites transaccionales
- Los agregados deben ser pequeños y enfocados
- Usar métodos de fábrica para creación compleja

**Ejemplo:**

```typescript
// domain/model/order/Order.ts
import { OrderId } from './OrderId';
import { CustomerId } from '../customer/CustomerId';
import { OrderLineItem } from './OrderLineItem';
import { Money } from './Money';

export class Order {
  private readonly _id: OrderId;
  private readonly _customerId: CustomerId;
  private readonly _lineItems: OrderLineItem[] = [];
  private _status: OrderStatus;

  constructor(id: OrderId, customerId: CustomerId) {
    this._id = id;
    this._customerId = customerId;
    this._status = OrderStatus.PENDING;
  }

  static create(customerId: CustomerId): Order {
    return new Order(OrderId.generate(), customerId);
  }

  addLineItem(productId: ProductId, quantity: number, unitPrice: Money): void {
    if (this._status !== OrderStatus.PENDING) {
      throw new Error('Cannot add items to a confirmed order');
    }

    const lineItem = new OrderLineItem(productId, quantity, unitPrice);
    this._lineItems.push(lineItem);
  }

  removeLineItem(productId: ProductId): void {
    if (this._status !== OrderStatus.PENDING) {
      throw new Error('Cannot remove items from a confirmed order');
    }

    const index = this._lineItems.findIndex(item => 
      item.productId.equals(productId)
    );

    if (index === -1) {
      throw new Error('Line item not found');
    }

    this._lineItems.splice(index, 1);
  }

  confirm(): void {
    if (this._lineItems.length === 0) {
      throw new Error('Cannot confirm order without items');
    }
    if (this._status !== OrderStatus.PENDING) {
      throw new Error('Order has already been confirmed');
    }
    this._status = OrderStatus.CONFIRMED;
  }

  calculateTotal(): Money {
    return this._lineItems.reduce(
      (total, item) => total.add(item.subtotal()),
      Money.zero('USD')
    );
  }

  // Retornar vista inmutable
  get lineItems(): readonly OrderLineItem[] {
    return Object.freeze([...this._lineItems]);
  }

  get id(): OrderId {
    return this._id;
  }

  get customerId(): CustomerId {
    return this._customerId;
  }

  get status(): OrderStatus {
    return this._status;
  }
}

enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED'
}
```

---

### 4. Servicios de Dominio

Los servicios de dominio contienen lógica de negocio que no pertenece naturalmente a ninguna entidad o value object.

**Reglas:**
- Crear servicios de dominio SOLO cuando la lógica no encaja en entidades/value objects
- Los servicios de dominio NO deben tener estado
- Deben operar sobre objetos del dominio, no sobre primitivos
- Usar nombres del lenguaje del dominio

**Ejemplo:**

```typescript
// domain/services/PricingService.ts
import { Product } from '../model/product/Product';
import { Customer } from '../model/customer/Customer';
import { Money } from '../model/Money';
import { DiscountRepository } from '../ports/DiscountRepository';

export class PricingService {
  constructor(private readonly discountRepository: DiscountRepository) {}

  calculateProductPrice(product: Product, customer: Customer): Money {
    let finalPrice = product.basePrice;

    // Aplicar descuento por volumen del cliente
    if (customer.totalPurchases.isGreaterThan(Money.of(1000, 'USD'))) {
      finalPrice = finalPrice.multiplyBy(0.9); // 10% descuento
    }

    // Aplicar descuentos especiales
    const discount = this.discountRepository.findActiveDiscountForProduct(
      product.id
    );
    if (discount) {
      finalPrice = discount.apply(finalPrice);
    }

    return finalPrice;
  }
}
```

---

## 🌐 Reglas de Bounded Contexts

### 10. Bounded Contexts (Contextos Delimitados)

Los Bounded Contexts son límites explícitos dentro de los cuales un modelo de dominio es aplicable.

**Reglas:**
- Cada contexto representa un subdominio del negocio
- Los contextos son autónomos e independientes
- Usar nombres del negocio para los contextos (no técnicos)
- Cada contexto puede tener su propia base de datos
- La comunicación entre contextos debe ser explícita
- Evitar dependencias directas entre contextos

**Ejemplos de Bounded Contexts:**
- UserManagement (Gestión de Usuarios)
- Sales (Ventas)
- Inventory (Inventario)
- Billing (Facturación)
- Shipping (Envíos)

**Estructura:**

```typescript
src/Contexts/
├── UserManagement/      # Contexto de gestión de usuarios
│   ├── Users/
│   └── Profiles/
│
├── Sales/               # Contexto de ventas
│   ├── Orders/
│   └── Products/
│
└── Shared/             # Kernel compartido
    ├── domain/
    └── infrastructure/
```

---

### 11. Shared Kernel (Kernel Compartido)

El Shared Kernel contiene código compartido por todos los contextos.

**Reglas:**
- Mantener al MÍNIMO necesario
- Solo incluir código realmente genérico
- Debe ser muy estable (cambios afectan todos los contextos)
- Clases base abstractas (AggregateRoot, ValueObject, DomainEvent)
- Utilidades genéricas (Criteria, Filters, Order)
- NO incluir lógica de negocio específica

**Ejemplo:**

```typescript
// Contexts/Shared/domain/AggregateRoot.ts
import { DomainEvent } from './DomainEvent';

export abstract class AggregateRoot {
  private domainEvents: DomainEvent[] = [];

  pullDomainEvents(): DomainEvent[] {
    const events = [...this.domainEvents];
    this.domainEvents = [];
    return events;
  }

  protected recordEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  protected clearEvents(): void {
    this.domainEvents = [];
  }
}
```

```typescript
// Contexts/Shared/domain/ValueObject.ts
export abstract class ValueObject<T> {
  constructor(protected readonly value: T) {}

  equals(other: ValueObject<T>): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    return JSON.stringify(this.value) === JSON.stringify(other.value);
  }

  toString(): string {
    return String(this.value);
  }
}
```

```typescript
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

  constructor(eventName: string) {
    this.eventId = this.generateEventId();
    this.occurredOn = new Date();
    this.eventName = eventName;
  }

  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

```typescript
// Contexts/Shared/domain/criteria/Criteria.ts
import { Filters } from './Filters';
import { Order } from './Order';

export class Criteria {
  constructor(
    readonly filters: Filters,
    readonly order: Order,
    readonly limit?: number,
    readonly offset?: number
  ) {}

  hasFilters(): boolean {
    return this.filters.filters.length > 0;
  }
}
```

```typescript
// Contexts/Shared/domain/EventBus.ts
import { DomainEvent } from './DomainEvent';

export interface EventBus {
  publish(events: DomainEvent[]): Promise<void>;
}
```

---

### 12. Comunicación entre Contextos

La comunicación entre Bounded Contexts debe ser explícita y desacoplada.

**Reglas:**
- Usar eventos de dominio para comunicación asíncrona
- Usar APIs REST/GraphQL para comunicación síncrona
- NO compartir modelos de dominio entre contextos
- Usar DTOs o contratos explícitos
- Cada contexto tiene su propia representación de conceptos compartidos

**Ejemplo - Comunicación por Eventos:**

```typescript
// Contexts/UserManagement/Users/domain/UserCreated.ts
import { BaseDomainEvent } from '../../../Shared/domain/DomainEvent';

export class UserCreated extends BaseDomainEvent {
  constructor(
    readonly userId: string,
    readonly email: string,
    readonly name: string
  ) {
    super('user.created');
  }
}
```

```typescript
// Contexts/Sales/Orders/application/OnUserCreated/CreateDefaultShoppingCart.ts
import { UserCreated } from '../../../../UserManagement/Users/domain/UserCreated';
import { ShoppingCartRepository } from '../../domain/ShoppingCartRepository';
import { ShoppingCart } from '../../domain/ShoppingCart';

export class CreateDefaultShoppingCart {
  constructor(private readonly repository: ShoppingCartRepository) {}

  async handle(event: UserCreated): Promise<void> {
    // Sales tiene su propia representación del usuario
    const customerId = event.userId;
    
    const cart = ShoppingCart.createEmpty(customerId);
    await this.repository.save(cart);
  }
}
```

**Ejemplo - Comunicación por API:**

```typescript
// Contexts/Sales/Orders/domain/CustomerService.ts
// Puerto para comunicarse con UserManagement
export interface CustomerService {
  isCustomerActive(customerId: string): Promise<boolean>;
  getCustomerEmail(customerId: string): Promise<string>;
}

// Contexts/Sales/Orders/infrastructure/http/HttpCustomerService.ts
import { CustomerService } from '../../domain/CustomerService';

export class HttpCustomerService implements CustomerService {
  constructor(private readonly baseUrl: string) {}

  async isCustomerActive(customerId: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/users/${customerId}`);
    const data = await response.json();
    return data.isActive;
  }

  async getCustomerEmail(customerId: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/users/${customerId}`);
    const data = await response.json();
    return data.email;
  }
}
```

---

## 🔌 Reglas de Puertos (Ports)

### 13. Interfaces de Repositorio

Los repositorios son interfaces que definen cómo persistir y recuperar agregados.

**Reglas:**
- Definir interfaces en la capa de dominio (`domain/ports`)
- Los repositorios trabajan SOLO con Raíces de Agregado
- Usar métodos específicos del dominio, no CRUD genérico
- Retornar objetos del dominio, nunca DTOs o modelos de BD
- Lanzar excepciones del dominio

**Ejemplo:**

```typescript
// domain/ports/UserRepository.ts
import { User } from '../model/user/User';
import { UserId } from '../model/user/UserId';
import { Email } from '../model/user/Email';

export interface UserRepository {
  save(user: User): Promise<void>;
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  findActiveUsers(): Promise<User[]>;
  delete(id: UserId): Promise<void>;
}
```

---

### 14. Puertos de Infraestructura

Los puertos de infraestructura definen servicios externos (email, mensajería, etc.).

**Reglas:**
- Definir en la capa de aplicación (`application/ports`)
- Usar lenguaje del dominio, no términos técnicos
- Deben ser interfaces enfocadas (Single Responsibility)

**Ejemplo:**

```typescript
// application/ports/EmailNotificationPort.ts
import { Email } from '../../domain/model/user/Email';

export interface EmailNotificationPort {
  sendWelcomeEmail(userEmail: Email, userName: string): Promise<void>;
  sendEmailChangeNotification(oldEmail: Email, newEmail: Email): Promise<void>;
  sendPasswordResetEmail(userEmail: Email, resetToken: string): Promise<void>;
}
```

```typescript
// application/ports/EventPublisherPort.ts
import { DomainEvent } from '../../domain/events/DomainEvent';

export interface EventPublisherPort {
  publish(event: DomainEvent): Promise<void>;
  publishBatch(events: DomainEvent[]): Promise<void>;
}
```

---

## 🎬 Reglas de Aplicación (Application Layer)

### 7. Servicios de Aplicación

Los servicios de aplicación orquestan operaciones de negocio pero NO contienen lógica de negocio. Se organizan por operación específica dentro de carpetas temáticas.

**Reglas:**
- Cada servicio de aplicación representa UNA operación de negocio específica
- NO debe contener lógica de negocio, solo orquestación
- Organizar por operación: Create/, Update/, Find/, Delete/, etc.
- Manejar transacciones y publicación de eventos
- Recibir DTOs simples (Request) y retornar DTOs simples (Response)
- Nombrar servicios con sufijo que indique la acción: Creator, Finder, Updater, etc.

**Estructura por operación:**
```
application/
├── Create/
│   ├── UserCreator.ts           # Servicio de aplicación
│   └── CreateUserRequest.ts     # DTO de entrada
├── ChangeEmail/
│   ├── UserEmailChanger.ts
│   └── ChangeEmailRequest.ts
└── Find/
    ├── UserFinder.ts
    ├── FindUserRequest.ts
    └── UserResponse.ts          # DTO de salida
```

**Ejemplo - Crear Usuario:**

```typescript
// Contexts/UserManagement/Users/application/Create/CreateUserRequest.ts
export interface CreateUserRequest {
  email: string;
  name: string;
}

// Contexts/UserManagement/Users/application/Create/UserCreator.ts
import { UserRepository } from '../../domain/UserRepository';
import { EmailNotificationPort } from '../../../../Shared/domain/EmailNotificationPort';
import { EventBus } from '../../../../Shared/domain/EventBus';
import { User } from '../../domain/User';
import { Email } from '../../domain/Email';
import { CreateUserRequest } from './CreateUserRequest';

export class UserCreator {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailNotification: EmailNotificationPort,
    private readonly eventBus: EventBus
  ) {}

  async run(request: CreateUserRequest): Promise<string> {
    // Validación y creación de value objects
    const email = new Email(request.email);

    // Verificar unicidad
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Crear entidad (lógica de negocio en el dominio)
    const user = User.create(email, request.name);

    // Persistir
    await this.userRepository.save(user);

    // Efectos secundarios
    await this.emailNotification.sendWelcomeEmail(email, request.name);
    
    // Publicar eventos de dominio
    await this.eventBus.publish(user.pullDomainEvents());

    return user.id.value;
  }
}
```

**Ejemplo - Cambiar Email:**

```typescript
// Contexts/UserManagement/Users/application/ChangeEmail/ChangeEmailRequest.ts
export interface ChangeEmailRequest {
  userId: string;
  newEmail: string;
}

// Contexts/UserManagement/Users/application/ChangeEmail/UserEmailChanger.ts
import { UserRepository } from '../../domain/UserRepository';
import { EmailNotificationPort } from '../../../../Shared/domain/EmailNotificationPort';
import { EventBus } from '../../../../Shared/domain/EventBus';
import { UserId } from '../../domain/UserId';
import { Email } from '../../domain/Email';
import { ChangeEmailRequest } from './ChangeEmailRequest';

export class UserEmailChanger {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailNotification: EmailNotificationPort,
    private readonly eventBus: EventBus
  ) {}

  async run(request: ChangeEmailRequest): Promise<void> {
    const userId = new UserId(request.userId);
    const newEmail = new Email(request.newEmail);

    // Recuperar agregado
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error(`User not found: ${userId.value}`);
    }

    // Verificar unicidad del nuevo email
    const existingUser = await this.userRepository.findByEmail(newEmail);
    if (existingUser && !existingUser.id.equals(userId)) {
      throw new Error('Email already in use by another user');
    }

    const oldEmail = user.email;

    // Ejecutar lógica de negocio (en el dominio)
    user.changeEmail(newEmail);

    // Persistir
    await this.userRepository.save(user);

    // Notificar
    await this.emailNotification.sendEmailChangeNotification(oldEmail, newEmail);

    // Publicar eventos
    await this.eventBus.publish(user.pullDomainEvents());
  }
}
```

**Ejemplo - Buscar Usuario:**

```typescript
// Contexts/UserManagement/Users/application/Find/FindUserRequest.ts
export interface FindUserRequest {
  userId: string;
}

// Contexts/UserManagement/Users/application/Find/UserResponse.ts
export interface UserResponse {
  userId: string;
  email: string;
  name: string;
  isActive: boolean;
}

// Contexts/UserManagement/Users/application/Find/UserFinder.ts
import { UserRepository } from '../../domain/UserRepository';
import { UserId } from '../../domain/UserId';
import { FindUserRequest } from './FindUserRequest';
import { UserResponse } from './UserResponse';

export class UserFinder {
  constructor(private readonly userRepository: UserRepository) {}

  async run(request: FindUserRequest): Promise<UserResponse> {
    const userId = new UserId(request.userId);

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error(`User not found: ${userId.value}`);
    }

    return {
      userId: user.id.value,
      email: user.email.value,
      name: user.name,
      isActive: user.isActive
    };
  }
}
```

**Ejemplo - Buscar con Criterios (patrón Specification):**

```typescript
// Contexts/UserManagement/Users/application/SearchByCriteria/UsersByCriteriaSearcher.ts
import { Criteria } from '../../../../Shared/domain/criteria/Criteria';
import { Filters } from '../../../../Shared/domain/criteria/Filters';
import { Order } from '../../../../Shared/domain/criteria/Order';
import { UserRepository } from '../../domain/UserRepository';
import { UsersResponse } from './UsersResponse';

export class UsersByCriteriaSearcher {
  constructor(private readonly repository: UserRepository) {}

  async run(
    filters: Filters, 
    order: Order, 
    limit?: number, 
    offset?: number
  ): Promise<UsersResponse> {
    const criteria = new Criteria(filters, order, limit, offset);
    const users = await this.repository.matching(criteria);

    return new UsersResponse(users);
  }
}
```

---

## 🔧 Reglas de Adaptadores (Adapters)

### 8. Adaptadores Primarios (Entrada)

Los adaptadores primarios traducen peticiones externas a llamadas a servicios de aplicación.

**Reglas:**
- NO deben contener lógica de negocio
- Solo traducción y validación de entrada
- Manejar errores HTTP, serialización, etc.
- Delegar todo a servicios de aplicación (Creator, Finder, etc.)

**Ejemplo:**

```typescript
// Contexts/UserManagement/Users/infrastructure/http/UserController.ts
import { Request, Response, NextFunction } from 'express';
import { UserCreator } from '../../application/Create/UserCreator';
import { UserFinder } from '../../application/Find/UserFinder';
import { UserEmailChanger } from '../../application/ChangeEmail/UserEmailChanger';

export class UserController {
  constructor(
    private readonly userCreator: UserCreator,
    private readonly userFinder: UserFinder,
    private readonly userEmailChanger: UserEmailChanger
  ) {}

  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, name } = req.body;

      if (!email || !name) {
        res.status(400).json({ error: 'Email and name are required' });
        return;
      }

      const userId = await this.userCreator.run({ email, name });

      res.status(201).json({ userId });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('already exists')) {
          res.status(409).json({ error: error.message });
          return;
        }
        if (error.message.includes('Invalid email')) {
          res.status(400).json({ error: error.message });
          return;
        }
      }
      next(error);
    }
  }

  async getUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;

      const user = await this.userFinder.run({ userId });

      res.status(200).json(user);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
        return;
      }
      next(error);
    }
  }

  async changeEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const { newEmail } = req.body;

      if (!newEmail) {
        res.status(400).json({ error: 'New email is required' });
        return;
      }

      await this.userEmailChanger.run({ userId, newEmail });

      res.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          res.status(404).json({ error: error.message });
          return;
        }
        if (error.message.includes('already in use')) {
          res.status(409).json({ error: error.message });
          return;
        }
      }
      next(error);
    }
  }
}
```

---

### 9. Adaptadores Secundarios (Salida)

Los adaptadores secundarios implementan puertos y manejan complejidades externas.

**Reglas:**
- Implementar puertos definidos en domain
- Manejar toda la complejidad tecnológica
- Traducir entre objetos del dominio y representaciones externas
- NO exponer detalles de implementación al dominio
- Incluir reintentos, circuit breakers cuando sea apropiado

**Ejemplo:**

```typescript
// Contexts/UserManagement/Users/infrastructure/persistence/TypeOrmUserRepository.ts
import { Repository } from 'typeorm';
import { UserRepository } from '../../domain/UserRepository';
import { User } from '../../domain/User';
import { UserId } from '../../domain/UserId';
import { Email } from '../../domain/Email';
import { UserModel } from './UserModel';

export class TypeOrmUserRepository implements UserRepository {
  constructor(private readonly repository: Repository<UserModel>) {}

  async save(user: User): Promise<void> {
    const model = this.toModel(user);
    await this.repository.save(model);
  }

  async findById(id: UserId): Promise<User | null> {
    const model = await this.repository.findOne({
      where: { id: id.value }
    });

    return model ? this.toDomain(model) : null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    const model = await this.repository.findOne({
      where: { email: email.value }
    });

    return model ? this.toDomain(model) : null;
  }

  async findActiveUsers(): Promise<User[]> {
    const models = await this.repository.find({
      where: { isActive: true }
    });

    return models.map(model => this.toDomain(model));
  }

  async delete(id: UserId): Promise<void> {
    await this.repository.delete({ id: id.value });
  }

  private toModel(user: User): UserModel {
    const model = new UserModel();
    model.id = user.id.value;
    model.email = user.email.value;
    model.name = user.name;
    model.isActive = user.isActive;
    return model;
  }

  private toDomain(model: UserModel): User {
    return new User(
      new UserId(model.id),
      new Email(model.email),
      model.name,
      model.isActive
    );
  }
}
```

```typescript
// Contexts/UserManagement/Users/infrastructure/persistence/UserModel.ts
import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('users')
export class UserModel {
  @PrimaryColumn()
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  name!: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}
```

**Ejemplo - Adaptador de Email:**

```typescript
// Contexts/Shared/infrastructure/email/SmtpEmailAdapter.ts
import * as nodemailer from 'nodemailer';
import { EmailNotificationPort } from '../../domain/EmailNotificationPort';
import { Email } from '../../../UserManagement/Users/domain/Email';

export class SmtpEmailAdapter implements EmailNotificationPort {
  private transporter: nodemailer.Transporter;

  constructor(
    private readonly smtpConfig: {
      host: string;
      port: number;
      user: string;
      password: string;
    }
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.smtpConfig.host,
      port: this.smtpConfig.port,
      auth: {
        user: this.smtpConfig.user,
        pass: this.smtpConfig.password
      }
    });
  }

  async sendWelcomeEmail(userEmail: Email, userName: string): Promise<void> {
    await this.transporter.sendMail({
      from: 'noreply@example.com',
      to: userEmail.value,
      subject: 'Welcome!',
      html: `<h1>Welcome ${userName}!</h1><p>Thanks for joining us.</p>`
    });
  }

  async sendEmailChangeNotification(
    oldEmail: Email,
    newEmail: Email
  ): Promise<void> {
    await this.transporter.sendMail({
      from: 'noreply@example.com',
      to: newEmail.value,
      subject: 'Email Changed',
      html: `<p>Your email has been changed from ${oldEmail.value} to ${newEmail.value}</p>`
    });
  }

  async sendPasswordResetEmail(
    userEmail: Email,
    resetToken: string
  ): Promise<void> {
    await this.transporter.sendMail({
      from: 'noreply@example.com',
      to: userEmail.value,
      subject: 'Password Reset',
      html: `<p>Reset token: ${resetToken}</p>`
    });
  }
}
```

---

## 🧪 Reglas de Testing

### 15. Test-Driven Development (TDD)

**Reglas:**
- Escribir el test ANTES de implementar la funcionalidad
- Seguir el ciclo: Red → Green → Refactor
- Cada test debe validar un solo comportamiento
- Los tests deben ser independientes entre sí
- Usar nombres descriptivos que expliquen el comportamiento esperado

**Ciclo TDD:**
1. **Red**: Escribir un test que falle
2. **Green**: Escribir el código mínimo para que pase
3. **Refactor**: Mejorar el código manteniendo los tests verdes

**Ejemplo del ciclo:**

```typescript
// tests/domain/model/user/User.test.ts

describe('User', () => {
  // 1. RED - Test que falla
  it('should change email when user is active', () => {
    const user = UserMother.activeUser();
    const newEmail = EmailMother.random();

    user.changeEmail(newEmail);

    expect(user.email).toEqual(newEmail);
  });

  // 2. GREEN - Implementar en User.ts para que pase

  // 3. REFACTOR - Mejorar si es necesario
});
```

---

### 16. Mother Object Pattern

El patrón Mother Object crea objetos de prueba de manera consistente y mantenible.

**Reglas:**
- Crear un "Mother" por cada entidad/value object importante
- Los mothers deben proveer valores por defecto razonables
- Permitir personalización de atributos específicos
- Centralizar la creación de datos de prueba
- Mantener los mothers en `tests/mothers/`

**Ejemplo:**

```typescript
// tests/mothers/UserMother.ts
import { User } from '../../src/domain/model/user/User';
import { UserId } from '../../src/domain/model/user/UserId';
import { Email } from '../../src/domain/model/user/Email';
import { EmailMother } from './EmailMother';
import { UserIdMother } from './UserIdMother';

export class UserMother {
  static create(params?: {
    id?: UserId;
    email?: Email;
    name?: string;
    isActive?: boolean;
  }): User {
    return new User(
      params?.id ?? UserIdMother.random(),
      params?.email ?? EmailMother.random(),
      params?.name ?? 'John Doe',
      params?.isActive ?? true
    );
  }

  static activeUser(): User {
    return this.create({ isActive: true });
  }

  static inactiveUser(): User {
    return this.create({ isActive: false });
  }

  static withEmail(email: Email): User {
    return this.create({ email });
  }

  static withName(name: string): User {
    return this.create({ name });
  }

  static johnDoe(): User {
    return this.create({
      email: new Email('john.doe@example.com'),
      name: 'John Doe'
    });
  }

  static janeDoe(): User {
    return this.create({
      email: new Email('jane.doe@example.com'),
      name: 'Jane Doe'
    });
  }
}
```

```typescript
// tests/mothers/EmailMother.ts
import { Email } from '../../src/domain/model/user/Email';

export class EmailMother {
  static create(value: string): Email {
    return new Email(value);
  }

  static random(): Email {
    const randomString = Math.random().toString(36).substring(7);
    return new Email(`${randomString}@example.com`);
  }

  static withDomain(domain: string): Email {
    const randomString = Math.random().toString(36).substring(7);
    return new Email(`${randomString}@${domain}`);
  }

  static invalid(): string {
    return 'invalid-email';
  }
}
```

```typescript
// tests/mothers/UserIdMother.ts
import { UserId } from '../../src/domain/model/user/UserId';

export class UserIdMother {
  static create(value: string): UserId {
    return new UserId(value);
  }

  static random(): UserId {
    return UserId.generate();
  }
}
```

---

### 17. Estrategias de Testing

**Tests Unitarios (Dominio):**

```typescript
// tests/Contexts/UserManagement/Users/domain/User.test.ts
import { User } from '../../../../../src/Contexts/UserManagement/Users/domain/User';
import { UserMother } from '../../../../mothers/UserMother';
import { EmailMother } from '../../../../mothers/EmailMother';

describe('User', () => {
  describe('changeEmail', () => {
    it('should change email when user is active', () => {
      const user = UserMother.activeUser();
      const newEmail = EmailMother.random();

      user.changeEmail(newEmail);

      expect(user.email).toEqual(newEmail);
    });

    it('should throw error when user is inactive', () => {
      const user = UserMother.inactiveUser();
      const newEmail = EmailMother.random();

      expect(() => user.changeEmail(newEmail)).toThrow(
        'Cannot change email of inactive user'
      );
    });

    it('should register domain event when email changes', () => {
      const user = UserMother.activeUser();
      const oldEmail = user.email;
      const newEmail = EmailMother.random();

      user.changeEmail(newEmail);

      const events = user.pullDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0].eventName).toBe('user.email.changed');
    });
  });

  describe('deactivate', () => {
    it('should deactivate active user', () => {
      const user = UserMother.activeUser();

      user.deactivate();

      expect(user.isActive).toBe(false);
    });

    it('should throw error when user is already inactive', () => {
      const user = UserMother.inactiveUser();

      expect(() => user.deactivate()).toThrow('User is already inactive');
    });
  });
});
```

**Tests Unitarios (Servicios de Aplicación con Mocks):**

```typescript
// tests/Contexts/UserManagement/Users/application/Create/UserCreator.test.ts
import { UserCreator } from '../../../../../../src/Contexts/UserManagement/Users/application/Create/UserCreator';
import { UserRepository } from '../../../../../../src/Contexts/UserManagement/Users/domain/UserRepository';
import { EmailNotificationPort } from '../../../../../../src/Contexts/Shared/domain/EmailNotificationPort';
import { EventBus } from '../../../../../../src/Contexts/Shared/domain/EventBus';
import { UserMother } from '../../../../../mothers/UserMother';
import { EmailMother } from '../../../../../mothers/EmailMother';

describe('UserCreator', () => {
  let userCreator: UserCreator;
  let userRepository: jest.Mocked<UserRepository>;
  let emailNotification: jest.Mocked<EmailNotificationPort>;
  let eventBus: jest.Mocked<EventBus>;

  beforeEach(() => {
    userRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findActiveUsers: jest.fn(),
      delete: jest.fn()
    };

    emailNotification = {
      sendWelcomeEmail: jest.fn(),
      sendEmailChangeNotification: jest.fn(),
      sendPasswordResetEmail: jest.fn()
    };

    eventBus = {
      publish: jest.fn()
    };

    userCreator = new UserCreator(
      userRepository,
      emailNotification,
      eventBus
    );
  });

  it('should create a new user successfully', async () => {
    const email = 'john@example.com';
    const name = 'John Doe';
    userRepository.findByEmail.mockResolvedValue(null);

    const userId = await userCreator.run({ email, name });

    expect(userId).toBeDefined();
    expect(userRepository.save).toHaveBeenCalledTimes(1);
    expect(emailNotification.sendWelcomeEmail).toHaveBeenCalledWith(
      expect.any(Object),
      name
    );
  });

  it('should throw error when email already exists', async () => {
    const email = 'john@example.com';
    const existingUser = UserMother.withEmail(EmailMother.create(email));
    userRepository.findByEmail.mockResolvedValue(existingUser);

    await expect(
      userCreator.run({ email, name: 'John Doe' })
    ).rejects.toThrow('User with this email already exists');

    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('should throw error when email is invalid', async () => {
    const invalidEmail = EmailMother.invalid();

    await expect(
      userCreator.run({ email: invalidEmail, name: 'John Doe' })
    ).rejects.toThrow();
  });
});
```

**Tests de Integración (con implementaciones in-memory):**

```typescript
// tests/Contexts/UserManagement/Users/infrastructure/persistence/InMemoryUserRepository.ts
import { UserRepository } from '../../../../../../src/Contexts/UserManagement/Users/domain/UserRepository';
import { User } from '../../../../../../src/Contexts/UserManagement/Users/domain/User';
import { UserId } from '../../../../../../src/Contexts/UserManagement/Users/domain/UserId';
import { Email } from '../../../../../../src/Contexts/UserManagement/Users/domain/Email';

export class InMemoryUserRepository implements UserRepository {
  private users: Map<string, User> = new Map();

  async save(user: User): Promise<void> {
    this.users.set(user.id.value, user);
  }

  async findById(id: UserId): Promise<User | null> {
    return this.users.get(id.value) ?? null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email.equals(email)) {
        return user;
      }
    }
    return null;
  }

  async findActiveUsers(): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.isActive);
  }

  async delete(id: UserId): Promise<void> {
    this.users.delete(id.value);
  }

  clear(): void {
    this.users.clear();
  }
}
```

```typescript
// tests/Contexts/UserManagement/Users/application/Create/UserCreator.integration.test.ts
import { UserCreator } from '../../../../../../src/Contexts/UserManagement/Users/application/Create/UserCreator';
import { InMemoryUserRepository } from '../../infrastructure/persistence/InMemoryUserRepository';
import { Email } from '../../../../../../src/Contexts/UserManagement/Users/domain/Email';

describe('UserCreator Integration', () => {
  let userCreator: UserCreator;
  let userRepository: InMemoryUserRepository;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    
    const mockEmailNotification = {
      sendWelcomeEmail: jest.fn(),
      sendEmailChangeNotification: jest.fn(),
      sendPasswordResetEmail: jest.fn()
    };

    const mockEventBus = {
      publish: jest.fn()
    };

    userCreator = new UserCreator(
      userRepository,
      mockEmailNotification,
      mockEventBus
    );
  });

  afterEach(() => {
    userRepository.clear();
  });

  it('should create and persist user successfully', async () => {
    const email = 'john@example.com';
    const name = 'John Doe';

    const userId = await userCreator.run({ email, name });

    const savedUser = await userRepository.findByEmail(new Email(email));
    expect(savedUser).not.toBeNull();
    expect(savedUser?.id.value).toBe(userId);
    expect(savedUser?.name).toBe(name);
  });
});
```

---

## 🎨 Reglas de Estilo: ESLint y Prettier

### 18. Configuración de ESLint

**Reglas obligatorias:**

```json
// .eslintrc.json
{
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "prettier"
  ],
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/explicit-member-accessibility": ["error", {
      "accessibility": "explicit"
    }],
    "@typescript-eslint/naming-convention": [
      "error",
      {
        "selector": "interface",
        "format": ["PascalCase"]
      },
      {
        "selector": "class",
        "format": ["PascalCase"]
      },
      {
        "selector": "typeAlias",
        "format": ["PascalCase"]
      }
    ],
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "prefer-const": "error",
    "no-var": "error",
    "eqeqeq": ["error", "always"]
  }
}
```

---

### 19. Configuración de Prettier

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 90,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

---

## 📋 Reglas de Nomenclatura

### 20. Convenciones de Nombres

**Clases y Tipos:**
- PascalCase para clases, interfaces, types, enums
- Usar nombres del dominio (Ubiquitous Language)
- Evitar términos técnicos en el dominio (Manager, Helper, Util)

**Archivos:**
- PascalCase para clases: `User.ts`, `Email.ts`
- camelCase para utilidades: `orderCalculator.ts`
- Sufijos descriptivos: `UserRepository.ts`, `CreateUserUseCase.ts`

**Variables y Funciones:**
- camelCase para variables y funciones
- Nombres descriptivos que revelen intención
- Usar verbos para funciones/métodos

**Constantes:**
- UPPER_SNAKE_CASE para constantes globales
- camelCase para constantes locales

**Ejemplos:**

```typescript
// ✅ Bien
class UserRepository {}
interface OrderRepository {}
type UserId = string;
enum OrderStatus {}

const MAX_RETRY_ATTEMPTS = 3;
const userEmail = 'user@example.com';

function calculateOrderTotal(): Money {}
async function sendNotification(): Promise<void> {}

// ❌ Mal
class userrepository {}
interface order_repository {}
type userid = string;

const maxretryattempts = 3;
const UserEmail = 'user@example.com';

function CalculateOrderTotal(): Money {}
```

---

## ⚡ Reglas de Dependencias

### 21. Dirección de Dependencias

**Regla de Oro:** Las dependencias deben apuntar hacia adentro (hacia el dominio).

```
Infrastructure → Application → Domain
     ↓              ↓
  Adapters    →  Use Cases  →  Entities/VOs
```

**Reglas específicas:**
- El dominio NO debe depender de nada externo
- La aplicación puede depender del dominio
- La infraestructura puede depender de aplicación y dominio
- Usar inversión de dependencias (interfaces) para desacoplar

**Ejemplo:**

```typescript
// ✅ Bien - Dominio define la interfaz
// domain/ports/UserRepository.ts
export interface UserRepository {
  save(user: User): Promise<void>;
}

// infrastructure implementa la interfaz del dominio
// infrastructure/adapters/secondary/TypeOrmUserRepository.ts
export class TypeOrmUserRepository implements UserRepository {
  async save(user: User): Promise<void> {
    // implementación
  }
}

// ❌ Mal - Dominio dependiendo de infraestructura
// domain/model/User.ts
import { TypeOrmUserRepository } from '../../infrastructure/...';
```

---

## 🚀 Scripts y Comandos

### 22. Scripts de package.json

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:integration": "jest --testPathPattern=integration",
    "lint": "eslint . --ext .ts",
    "lint:fix": "eslint . --ext .ts --fix",
    "format": "prettier --write \"src/**/*.ts\" \"tests/**/*.ts\"",
    "format:check": "prettier --check \"src/**/*.ts\" \"tests/**/*.ts\"",
    "typecheck": "tsc --noEmit"
  }
}
```

---

## 📚 Validación y Manejo de Errores

### 23. Excepciones de Dominio

**Reglas:**
- Crear jerarquía de excepciones del dominio
- Las excepciones deben usar lenguaje del negocio
- Validación fail-fast en constructores de value objects
- Las excepciones de dominio NO deben filtrar detalles técnicos

**Ejemplo:**

```typescript
// domain/exceptions/DomainException.ts
export abstract class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class InvalidEmailException extends DomainException {
  constructor(email: string) {
    super(`Invalid email format: ${email}`);
  }
}

export class UserNotFoundException extends DomainException {
  constructor(userId: string) {
    super(`User not found: ${userId}`);
  }
}

export class UserAlreadyExistsException extends DomainException {
  constructor(email: string) {
    super(`User with email ${email} already exists`);
  }
}

export class InactiveUserException extends DomainException {
  constructor(operation: string) {
    super(`Cannot ${operation} for inactive user`);
  }
}
```

---

## 🔍 Resumen de Mejores Prácticas

### Arquitectura
- ✅ Organizar por Bounded Contexts (subdominios del negocio)
- ✅ Cada contexto es autónomo e independiente
- ✅ Shared Kernel mínimo y estable
- ✅ Comunicación entre contextos explícita (eventos/APIs)

### Dominio
- ✅ Entidades con identidad y comportamiento
- ✅ Value Objects inmutables con validación
- ✅ Agregados pequeños con una raíz
- ✅ Servicios de dominio solo cuando sea necesario
- ✅ Usar lenguaje ubicuo del negocio

### Aplicación
- ✅ Servicios de aplicación organizados por operación
- ✅ Un servicio = una operación de negocio
- ✅ Orquestan, no contienen lógica
- ✅ Manejar transacciones y eventos
- ✅ Retornar DTOs, no objetos de dominio

### Infraestructura
- ✅ Adaptadores primarios delgados
- ✅ Adaptadores secundarios encapsulan complejidad técnica
- ✅ Mantener modelos de persistencia privados
- ✅ Traducir entre dominio y tecnología

### Testing
- ✅ TDD: Red → Green → Refactor
- ✅ Mother Objects para datos de prueba
- ✅ Tests unitarios sin mocks de dominio
- ✅ Mocks para puertos en tests de servicios de aplicación
- ✅ In-memory adapters para integración

### Calidad de Código
- ✅ ESLint configurado estrictamente
- ✅ Prettier para formato consistente
- ✅ TypeScript sin `any`
- ✅ Nombres descriptivos con lenguaje del dominio
- ✅ Dependencias apuntando hacia el dominio

---

## 📖 Recursos Adicionales

- [Domain-Driven Design - Eric Evans](https://www.amazon.com/Domain-Driven-Design-Tackling-Complexity-Software/dp/0321125215)
- [Hexagonal Architecture - Alistair Cockburn](https://alistair.cockburn.us/hexagonal-architecture/)
- [TypeScript DDD Example](https://github.com/CodelyTV/typescript-ddd-example)
- [ESLint TypeScript](https://typescript-eslint.io/)
- [Prettier](https://prettier.io/)

---

**Nota:** Estas reglas son una guía viva. Adapta y evoluciona según las necesidades de tu proyecto, pero mantén siempre la consistencia y los principios fundamentales de DDD y Arquitectura Hexagonal.
