import { DomainException } from '../../../Shared/domain/DomainException';

export class InvalidCredentialsException extends DomainException {
  public constructor() {
    super('The provided email or password is incorrect');
  }
}
