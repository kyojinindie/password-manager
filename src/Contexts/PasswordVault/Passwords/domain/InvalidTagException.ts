import { DomainException } from '../../../Shared/domain/DomainException';

export class InvalidTagException extends DomainException {
  public constructor(message: string) {
    super(message);
  }
}
