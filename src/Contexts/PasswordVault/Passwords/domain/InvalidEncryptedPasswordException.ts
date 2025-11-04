import { DomainException } from '../../../Shared/domain/DomainException';

export class InvalidEncryptedPasswordException extends DomainException {
  public constructor(message: string) {
    super(message);
  }
}
