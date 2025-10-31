/**
 * Infrastructure Layer Barrel Export
 *
 * This file exports all infrastructure components for the Authentication/Users context.
 * It provides a clean public API for the infrastructure layer.
 *
 * Architecture Notes:
 * - Infrastructure is the OUTERMOST layer in Hexagonal Architecture
 * - It contains all adapters (both primary and secondary)
 * - It depends on Application and Domain layers
 * - It should NOT be imported by Domain or Application layers
 */

// Secondary Adapters (Driven/Output)
export { JwtTokenGenerationService } from './JwtTokenGenerationService';

// Primary Adapters (Driving/Input)
export { LoginUserController } from './controllers/LoginUserController';

// Dependency Injection
export {
  createLoginUserController,
  createTokenGenerationService,
  createHashingService,
  createUserLoginUseCase,
} from './dependencies';
