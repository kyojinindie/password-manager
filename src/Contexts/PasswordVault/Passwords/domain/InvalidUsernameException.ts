import { DomainException } from '../../../Shared/domain/DomainException';

export class InvalidUsernameException extends DomainException {
  public constructor(message: string) {
    super(message);
  }
}
