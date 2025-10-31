import { AccessToken } from './AccessToken';
import { RefreshToken } from './RefreshToken';
import { UserId } from './UserId';

export interface TokenGenerationService {
  generateAccessToken(userId: UserId): Promise<AccessToken>;
  generateRefreshToken(userId: UserId): Promise<RefreshToken>;
}
