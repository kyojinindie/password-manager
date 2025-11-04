import { DomainException } from '../../../Shared/domain/DomainException';

export class InvalidSiteUrlException extends DomainException {
  public constructor(message: string) {
    super(message);
  }
}
