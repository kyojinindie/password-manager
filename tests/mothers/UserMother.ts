import { User } from '../../src/Contexts/Authentication/Users/domain/User';
import { UserId } from '../../src/Contexts/Authentication/Users/domain/UserId';
import { Email } from '../../src/Contexts/Authentication/Users/domain/Email';
import { Username } from '../../src/Contexts/Authentication/Users/domain/Username';
import { MasterPasswordHash } from '../../src/Contexts/Authentication/Users/domain/MasterPasswordHash';
import { Salt } from '../../src/Contexts/Authentication/Users/domain/Salt';
import { IsActive } from '../../src/Contexts/Authentication/Users/domain/IsActive';
import { CreatedAt } from '../../src/Contexts/Authentication/Users/domain/CreatedAt';
import { UserIdMother } from './UserIdMother';
import { EmailMother } from './EmailMother';
import { UsernameMother } from './UsernameMother';
import { MasterPasswordHashMother } from './MasterPasswordHashMother';
import { SaltMother } from './SaltMother';
import { IsActiveMother } from './IsActiveMother';
import { CreatedAtMother } from './CreatedAtMother';

export class UserMother {
  public static create(params?: {
    id?: UserId;
    email?: Email;
    username?: Username;
    masterPasswordHash?: MasterPasswordHash;
    salt?: Salt;
    isActive?: IsActive;
    createdAt?: CreatedAt;
  }): User {
    return new User(
      params?.id ?? UserIdMother.random(),
      params?.email ?? EmailMother.random(),
      params?.username ?? UsernameMother.random(),
      params?.masterPasswordHash ?? MasterPasswordHashMother.random(),
      params?.salt ?? SaltMother.random(),
      params?.isActive ?? IsActiveMother.active(),
      params?.createdAt ?? CreatedAtMother.random()
    );
  }

  public static random(): User {
    return this.create();
  }

  public static activeUser(): User {
    return this.create({ isActive: IsActiveMother.active() });
  }

  public static inactiveUser(): User {
    return this.create({ isActive: IsActiveMother.inactive() });
  }

  public static withEmail(email: Email): User {
    return this.create({ email });
  }

  public static withUsername(username: Username): User {
    return this.create({ username });
  }

  public static withId(id: UserId): User {
    return this.create({ id });
  }

  public static createNew(
    email: Email,
    username: Username,
    masterPasswordHash: MasterPasswordHash,
    salt: Salt
  ): User {
    return User.create(email, username, masterPasswordHash, salt);
  }

  public static createParams(): {
    email: Email;
    username: Username;
    masterPasswordHash: MasterPasswordHash;
    salt: Salt;
  } {
    return {
      email: EmailMother.random(),
      username: UsernameMother.random(),
      masterPasswordHash: MasterPasswordHashMother.random(),
      salt: SaltMother.random(),
    };
  }
}
