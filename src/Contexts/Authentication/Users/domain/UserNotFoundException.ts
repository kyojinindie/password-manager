import { DomainException } from '../../../Shared/domain/DomainException';

export class UserNotFoundException extends DomainException {
  public constructor(identifier: string) {
    super(`User with identifier '${identifier}' was not found`);
  }
}
