import { DomainException } from '../../../Shared/domain/DomainException';

export class InvalidSiteNameException extends DomainException {
  public constructor(message: string) {
    super(message);
  }
}
