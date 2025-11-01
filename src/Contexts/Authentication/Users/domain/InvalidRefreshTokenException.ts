import { DomainException } from '../../../Shared/domain/DomainException';

export class InvalidRefreshTokenException extends DomainException {
  public constructor() {
    super('The provided refresh token is invalid, expired, or has been revoked');
  }
}
