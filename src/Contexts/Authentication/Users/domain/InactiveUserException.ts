import { DomainException } from '../../../Shared/domain/DomainException';

export class InactiveUserException extends DomainException {
  public constructor() {
    super('User account is not active. Please contact support.');
  }
}
