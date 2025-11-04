import { DomainException } from '../../../Shared/domain/DomainException';

export class InvalidCategoryException extends DomainException {
  public constructor(message: string) {
    super(message);
  }
}
