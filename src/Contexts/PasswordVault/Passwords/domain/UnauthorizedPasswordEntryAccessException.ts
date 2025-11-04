import { DomainException } from '../../../Shared/domain/DomainException';

export class UnauthorizedPasswordEntryAccessException extends DomainException {
  public constructor() {
    super('User is not authorized to access this password entry');
  }
}
