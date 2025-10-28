import * as bcrypt from 'bcrypt';

export class MasterPasswordHashingService {
  private static readonly SALT_ROUNDS = 12;
  private static readonly MIN_LENGTH = 12;

  public async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, MasterPasswordHashingService.SALT_ROUNDS);
  }

  public async verify(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  public async generateSalt(): Promise<string> {
    return await bcrypt.genSalt(MasterPasswordHashingService.SALT_ROUNDS);
  }

  public validatePasswordComplexity(password: string): void {
    if (!password || password.length < MasterPasswordHashingService.MIN_LENGTH) {
      throw new Error(
        `Master Password must be at least ${MasterPasswordHashingService.MIN_LENGTH} characters long`
      );
    }

    if (!/[A-Z]/.test(password)) {
      throw new Error(
        'Master Password must contain at least one uppercase letter'
      );
    }

    if (!/[a-z]/.test(password)) {
      throw new Error(
        'Master Password must contain at least one lowercase letter'
      );
    }

    if (!/[0-9]/.test(password)) {
      throw new Error('Master Password must contain at least one number');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      throw new Error(
        'Master Password must contain at least one special character'
      );
    }
  }
}
