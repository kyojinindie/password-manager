/**
 * InvalidMasterPasswordChangeException
 *
 * Domain Exception thrown when master password change operation violates business rules.
 *
 * Possible scenarios:
 * - New password is the same as current password
 * - New password doesn't meet complexity requirements
 * - User is not allowed to change password (e.g., locked account, inactive)
 * - Current password verification failed
 *
 * This exception represents a business rule violation, not a technical error.
 * It should be thrown from domain methods when business invariants are violated.
 */
export class InvalidMasterPasswordChangeException extends Error {
  public constructor(reason: string) {
    super(`Cannot change master password: ${reason}`);
    this.name = 'InvalidMasterPasswordChangeException';
    Object.setPrototypeOf(this, InvalidMasterPasswordChangeException.prototype);
  }

  /**
   * Factory method: Current password verification failed
   */
  public static becauseCurrentPasswordIsIncorrect(): InvalidMasterPasswordChangeException {
    return new InvalidMasterPasswordChangeException(
      'The current master password is incorrect'
    );
  }

  /**
   * Factory method: New password is same as current password
   */
  public static becauseNewPasswordIsSameAsCurrent(): InvalidMasterPasswordChangeException {
    return new InvalidMasterPasswordChangeException(
      'The new master password must be different from the current one'
    );
  }

  /**
   * Factory method: New password doesn't meet complexity requirements
   */
  public static becausePasswordComplexityNotMet(): InvalidMasterPasswordChangeException {
    return new InvalidMasterPasswordChangeException(
      'The new master password does not meet complexity requirements'
    );
  }

  /**
   * Factory method: User account is locked
   */
  public static becauseAccountIsLocked(): InvalidMasterPasswordChangeException {
    return new InvalidMasterPasswordChangeException(
      'Cannot change password while account is locked'
    );
  }

  /**
   * Factory method: User account is inactive
   */
  public static becauseAccountIsInactive(): InvalidMasterPasswordChangeException {
    return new InvalidMasterPasswordChangeException(
      'Cannot change password for an inactive account'
    );
  }
}
