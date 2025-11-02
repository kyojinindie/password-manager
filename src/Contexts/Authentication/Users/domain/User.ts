import { AggregateRoot } from '../../../Shared/domain/AggregateRoot';
import { UserId } from './UserId';
import { Email } from './Email';
import { Username } from './Username';
import { MasterPasswordHash } from './MasterPasswordHash';
import { Salt } from './Salt';
import { IsActive } from './IsActive';
import { CreatedAt } from './CreatedAt';
import { FailedLoginAttempts } from './FailedLoginAttempts';
import { LastLoginAt } from './LastLoginAt';
import { MasterPasswordHashingService } from './MasterPasswordHashingService';
import { AccountLockedException } from './AccountLockedException';
import { InactiveUserException } from './InactiveUserException';

export class User extends AggregateRoot {
  private readonly _id: UserId;
  private readonly _email: Email;
  private readonly _username: Username;
  private readonly _masterPasswordHash: MasterPasswordHash;
  private readonly _salt: Salt;
  private readonly _isActive: IsActive;
  private readonly _createdAt: CreatedAt;
  private _failedLoginAttempts: FailedLoginAttempts;
  private _lastLoginAt: LastLoginAt;

  public constructor(
    id: UserId,
    email: Email,
    username: Username,
    masterPasswordHash: MasterPasswordHash,
    salt: Salt,
    isActive: IsActive,
    createdAt: CreatedAt,
    failedLoginAttempts: FailedLoginAttempts,
    lastLoginAt: LastLoginAt
  ) {
    super();
    this._id = id;
    this._email = email;
    this._username = username;
    this._masterPasswordHash = masterPasswordHash;
    this._salt = salt;
    this._isActive = isActive;
    this._createdAt = createdAt;
    this._failedLoginAttempts = failedLoginAttempts;
    this._lastLoginAt = lastLoginAt;
  }

  public static create(
    email: Email,
    username: Username,
    masterPasswordHash: MasterPasswordHash,
    salt: Salt
  ): User {
    const id = UserId.generate();
    const isActive = new IsActive(true);
    const createdAt = new CreatedAt(new Date());
    const failedLoginAttempts = FailedLoginAttempts.zero();
    const lastLoginAt = LastLoginAt.empty();
    return new User(
      id,
      email,
      username,
      masterPasswordHash,
      salt,
      isActive,
      createdAt,
      failedLoginAttempts,
      lastLoginAt
    );
  }

  public get id(): UserId {
    return this._id;
  }

  public get email(): Email {
    return this._email;
  }

  public get username(): Username {
    return this._username;
  }

  public get masterPasswordHash(): MasterPasswordHash {
    return this._masterPasswordHash;
  }

  public get salt(): Salt {
    return this._salt;
  }

  public get isActive(): IsActive {
    return this._isActive;
  }

  public get createdAt(): CreatedAt {
    return this._createdAt;
  }

  public get failedLoginAttempts(): FailedLoginAttempts {
    return this._failedLoginAttempts;
  }

  public get lastLoginAt(): LastLoginAt {
    return this._lastLoginAt;
  }

  public async verifyPassword(
    plainPassword: string,
    hashingService: MasterPasswordHashingService
  ): Promise<boolean> {
    return await hashingService.verify(plainPassword, this._masterPasswordHash.value);
  }

  public recordSuccessfulLogin(): void {
    this.ensureIsActive();
    this._failedLoginAttempts = this._failedLoginAttempts.reset();
    this._lastLoginAt = LastLoginAt.now();
  }

  public recordFailedLoginAttempt(): void {
    this._failedLoginAttempts = this._failedLoginAttempts.increment();
  }

  public isAccountLocked(): boolean {
    return this._failedLoginAttempts.isAccountLocked();
  }

  public ensureCanLogin(): void {
    this.ensureIsActive();
    this.ensureIsNotLocked();
  }

  /**
   * Changes the user's master password by returning a new User instance
   * with the updated password hash and salt.
   *
   * This method follows the immutability principle by creating a new User
   * instance instead of modifying the current one.
   *
   * Business Rules:
   * - Maintains all other user properties unchanged
   * - Only updates masterPasswordHash and salt
   * - Preserves aggregate identity (same userId)
   *
   * @param newMasterPasswordHash - The new hashed master password
   * @param newSalt - The new salt used for hashing
   * @returns User - New User instance with updated credentials
   */
  public changeMasterPassword(
    newMasterPasswordHash: MasterPasswordHash,
    newSalt: Salt
  ): User {
    return new User(
      this._id,
      this._email,
      this._username,
      newMasterPasswordHash,
      newSalt,
      this._isActive,
      this._createdAt,
      this._failedLoginAttempts,
      this._lastLoginAt
    );
  }

  private ensureIsActive(): void {
    if (this._isActive.isFalse()) {
      throw new InactiveUserException();
    }
  }

  private ensureIsNotLocked(): void {
    if (this.isAccountLocked()) {
      throw new AccountLockedException();
    }
  }

  public equals(other: User): boolean {
    if (!other || !(other instanceof User)) {
      return false;
    }
    return this._id.equals(other._id);
  }

  public toPrimitives(): {
    id: string;
    email: string;
    username: string;
    masterPasswordHash: string;
    salt: string;
    isActive: boolean;
    createdAt: Date;
    failedLoginAttempts: number;
    lastLoginAt: Date | null;
  } {
    return {
      id: this._id.value,
      email: this._email.value,
      username: this._username.value,
      masterPasswordHash: this._masterPasswordHash.value,
      salt: this._salt.value,
      isActive: this._isActive.value,
      createdAt: this._createdAt.value,
      failedLoginAttempts: this._failedLoginAttempts.value,
      lastLoginAt: this._lastLoginAt.value,
    };
  }
}
