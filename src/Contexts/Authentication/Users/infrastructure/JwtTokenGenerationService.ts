import * as jwt from 'jsonwebtoken';
import { TokenGenerationService } from '../domain/TokenGenerationService';
import { AccessToken } from '../domain/AccessToken';
import { RefreshToken } from '../domain/RefreshToken';
import { UserId } from '../domain/UserId';

/**
 * JWT Token Generation Service - Secondary Adapter
 *
 * Implements the TokenGenerationService port defined by the domain layer.
 * This adapter encapsulates the jsonwebtoken library and provides JWT-based
 * token generation for authentication.
 *
 * Architecture Notes:
 * - This is a SECONDARY (driven/output) adapter in Hexagonal Architecture
 * - It implements the domain port (interface) without the domain knowing about JWT
 * - All JWT-specific implementation details are hidden from the domain
 * - Expiration times come from domain Value Objects, NOT from this adapter
 *
 * Responsibilities:
 * - Generate JWT access tokens with userId in payload
 * - Generate JWT refresh tokens with userId in payload
 * - Sign tokens with secret from environment
 * - Set appropriate expiration times from domain VOs
 *
 * Technology Encapsulation:
 * - Domain doesn't know we're using JWT
 * - Domain only knows about AccessToken and RefreshToken VOs
 * - If we switch from JWT to another token format, only this file changes
 */
export class JwtTokenGenerationService implements TokenGenerationService {
  private readonly secret: string;

  public constructor(secret: string) {
    this.ensureSecretIsValid(secret);
    this.secret = secret;
  }

  /**
   * Generates a JWT access token for the given user
   *
   * @param userId - The user's unique identifier
   * @returns AccessToken VO containing the signed JWT
   *
   * Token payload includes:
   * - userId: User's unique identifier
   * - type: 'access' for token type identification
   * - iat: Issued at timestamp (automatic)
   * - exp: Expiration timestamp (automatic)
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  public async generateAccessToken(userId: UserId): Promise<AccessToken> {
    // Get expiration from domain VO - NOT hardcoded here
    const expirationMinutes = AccessToken.getExpirationMinutes();

    const payload = {
      userId: userId.value,
      type: 'access',
    };

    const options: jwt.SignOptions = {
      expiresIn: `${expirationMinutes}m`,
    };

    // Sign the token with our secret
    const token = jwt.sign(payload, this.secret, options);

    // Return domain VO (which validates JWT format)
    return new AccessToken(token);
  }

  /**
   * Generates a JWT refresh token for the given user
   *
   * @param userId - The user's unique identifier
   * @returns RefreshToken VO containing the signed JWT
   *
   * Token payload includes:
   * - userId: User's unique identifier
   * - type: 'refresh' for token type identification
   * - iat: Issued at timestamp (automatic)
   * - exp: Expiration timestamp (automatic)
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  public async generateRefreshToken(userId: UserId): Promise<RefreshToken> {
    // Get expiration from domain VO - NOT hardcoded here
    const expirationDays = RefreshToken.getExpirationDays();

    const payload = {
      userId: userId.value,
      type: 'refresh',
    };

    const options: jwt.SignOptions = {
      expiresIn: `${expirationDays}d`,
    };

    // Sign the token with our secret
    const token = jwt.sign(payload, this.secret, options);

    // Return domain VO (which validates JWT format)
    return new RefreshToken(token);
  }

  /**
   * Validates that the JWT secret is properly configured
   *
   * @param secret - The JWT secret to validate
   * @throws Error if secret is invalid or too weak
   */
  private ensureSecretIsValid(secret: string): void {
    if (!secret) {
      throw new Error(
        'JWT_SECRET is required. Please configure JWT_SECRET in your environment variables.'
      );
    }

    if (typeof secret !== 'string') {
      throw new Error('JWT_SECRET must be a string');
    }

    if (secret.trim().length === 0) {
      throw new Error('JWT_SECRET cannot be empty or whitespace');
    }

    // Enforce minimum secret length for security
    const MIN_SECRET_LENGTH = 32;
    if (secret.length < MIN_SECRET_LENGTH) {
      throw new Error(
        `JWT_SECRET must be at least ${MIN_SECRET_LENGTH} characters long for security. Current length: ${secret.length}`
      );
    }
  }
}
