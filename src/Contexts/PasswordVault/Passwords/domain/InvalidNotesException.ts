import { DomainException } from '../../../Shared/domain/DomainException';

export class InvalidNotesException extends DomainException {
  public constructor(message: string) {
    super(message);
  }
}
