import { DomainException } from '../../../Shared/domain/DomainException';

export class AccountLockedException extends DomainException {
  public constructor() {
    super(
      'Account has been locked due to too many failed login attempts. Please contact support.'
    );
  }
}
