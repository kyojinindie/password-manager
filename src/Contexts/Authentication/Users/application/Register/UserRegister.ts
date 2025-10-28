import { UserRepository } from '../../domain/UserRepository';
import { MasterPasswordHashingService } from '../../domain/MasterPasswordHashingService';
import { User } from '../../domain/User';
import { Email } from '../../domain/Email';
import { Username } from '../../domain/Username';
import { MasterPasswordHash } from '../../domain/MasterPasswordHash';
import { Salt } from '../../domain/Salt';
import { RegisterUserRequest } from './RegisterUserRequest';

export class UserRegister {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashingService: MasterPasswordHashingService
  ) {}

  public async run(request: RegisterUserRequest): Promise<string> {
    // Validate password complexity
    this.hashingService.validatePasswordComplexity(request.masterPassword);

    // Create value objects with validation
    const email = new Email(request.email);
    const username = new Username(request.username);

    // Check uniqueness
    await this.ensureEmailIsUnique(email);
    await this.ensureUsernameIsUnique(username);

    // Hash password with salt
    const salt = await this.hashingService.generateSalt();
    const hashedPassword = await this.hashingService.hash(request.masterPassword);

    const masterPasswordHash = new MasterPasswordHash(hashedPassword);
    const saltVO = new Salt(salt);

    // Create user entity
    const user = User.create(email, username, masterPasswordHash, saltVO);

    // Persist user
    await this.userRepository.save(user);

    return user.id.value;
  }

  private async ensureEmailIsUnique(email: Email): Promise<void> {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
  }

  private async ensureUsernameIsUnique(username: Username): Promise<void> {
    const existingUser = await this.userRepository.findByUsername(username);
    if (existingUser) {
      throw new Error('User with this username already exists');
    }
  }
}
