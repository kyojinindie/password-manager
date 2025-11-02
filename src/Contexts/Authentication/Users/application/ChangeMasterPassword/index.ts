/**
 * ChangeMasterPassword Use Case
 *
 * This module exports all components needed for the Change Master Password
 * use case following DDD and Hexagonal Architecture patterns.
 *
 * Exports:
 * - MasterPasswordChanger: The application service (orchestrator)
 * - ChangeMasterPasswordRequest: Input DTO
 * - ChangeMasterPasswordResponse: Output DTO
 */

export { MasterPasswordChanger } from './MasterPasswordChanger';
export { ChangeMasterPasswordRequest } from './ChangeMasterPasswordRequest';
export { ChangeMasterPasswordResponse } from './ChangeMasterPasswordResponse';
