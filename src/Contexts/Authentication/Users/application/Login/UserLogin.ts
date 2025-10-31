import { UserRepository } from '../../domain/UserRepository';
import { MasterPasswordHashingService } from '../../domain/MasterPasswordHashingService';
import { TokenGenerationService } from '../../domain/TokenGenerationService';
import { Email } from '../../domain/Email';
import { InvalidCredentialsException } from '../../domain/InvalidCredentialsException';
import { LoginUserRequest } from './LoginUserRequest';
import { LoginUserResponse } from './LoginUserResponse';
import { AccessToken } from '../../domain/AccessToken';

export class UserLogin {
  public constructor(
    private readonly userRepository: UserRepository,
    private readonly hashingService: MasterPasswordHashingService,
    private readonly tokenService: TokenGenerationService
  ) {}

  public async run(request: LoginUserRequest): Promise<LoginUserResponse> {
    // Step 1: Create Email VO from request
    const email = new Email(request.email);

    // Step 2: Find user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new InvalidCredentialsException();
    }

    // Step 3: Check if account can login (not locked, is active)
    user.ensureCanLogin();

    // Step 4: Verify password
    const isPasswordValid = await user.verifyPassword(
      request.masterPassword,
      this.hashingService
    );

    if (!isPasswordValid) {
      // Record failed attempt and save
      user.recordFailedLoginAttempt();
      await this.userRepository.save(user);
      throw new InvalidCredentialsException();
    }

    // Step 5: Password is valid - record successful login
    user.recordSuccessfulLogin();
    await this.userRepository.save(user);

    // Step 6: Generate tokens
    const accessToken = await this.tokenService.generateAccessToken(user.id);
    const refreshToken = await this.tokenService.generateRefreshToken(user.id);

    // Step 7: Return response DTO
    return {
      userId: user.id.value,
      accessToken: accessToken.value,
      refreshToken: refreshToken.value,
      expiresIn: AccessToken.getExpirationMinutes() * 60, // Convert to seconds
    };
  }
}
