import { AggregateRoot } from '../../../Shared/domain/AggregateRoot';
import { UserId } from './UserId';
import { Email } from './Email';
import { Username } from './Username';
import { MasterPasswordHash } from './MasterPasswordHash';
import { Salt } from './Salt';
import { IsActive } from './IsActive';
import { CreatedAt } from './CreatedAt';

export class User extends AggregateRoot {
  private readonly _id: UserId;
  private readonly _email: Email;
  private readonly _username: Username;
  private readonly _masterPasswordHash: MasterPasswordHash;
  private readonly _salt: Salt;
  private readonly _isActive: IsActive;
  private readonly _createdAt: CreatedAt;

  public constructor(
    id: UserId,
    email: Email,
    username: Username,
    masterPasswordHash: MasterPasswordHash,
    salt: Salt,
    isActive: IsActive,
    createdAt: CreatedAt
  ) {
    super();
    this._id = id;
    this._email = email;
    this._username = username;
    this._masterPasswordHash = masterPasswordHash;
    this._salt = salt;
    this._isActive = isActive;
    this._createdAt = createdAt;
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
    return new User(id, email, username, masterPasswordHash, salt, isActive, createdAt);
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
  } {
    return {
      id: this._id.value,
      email: this._email.value,
      username: this._username.value,
      masterPasswordHash: this._masterPasswordHash.value,
      salt: this._salt.value,
      isActive: this._isActive.value,
      createdAt: this._createdAt.value,
    };
  }
}
