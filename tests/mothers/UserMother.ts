import { User } from '../../src/Contexts/Authentication/Users/domain/User';
import { UserId } from '../../src/Contexts/Authentication/Users/domain/UserId';
import { Email } from '../../src/Contexts/Authentication/Users/domain/Email';
import { Username } from '../../src/Contexts/Authentication/Users/domain/Username';
import { MasterPasswordHash } from '../../src/Contexts/Authentication/Users/domain/MasterPasswordHash';
import { Salt } from '../../src/Contexts/Authentication/Users/domain/Salt';
import { IsActive } from '../../src/Contexts/Authentication/Users/domain/IsActive';
import { CreatedAt } from '../../src/Contexts/Authentication/Users/domain/CreatedAt';
import { FailedLoginAttempts } from '../../src/Contexts/Authentication/Users/domain/FailedLoginAttempts';
import { LastLoginAt } from '../../src/Contexts/Authentication/Users/domain/LastLoginAt';
import { UserIdMother } from './UserIdMother';
import { EmailMother } from './EmailMother';
import { UsernameMother } from './UsernameMother';
import { MasterPasswordHashMother } from './MasterPasswordHashMother';
import { SaltMother } from './SaltMother';
import { IsActiveMother } from './IsActiveMother';
import { CreatedAtMother } from './CreatedAtMother';
import { FailedLoginAttemptsMother } from './FailedLoginAttemptsMother';
import { LastLoginAtMother } from './LastLoginAtMother';

export class UserMother {
  public static create(params?: {
    id?: UserId;
    email?: Email;
    username?: Username;
    masterPasswordHash?: MasterPasswordHash;
    salt?: Salt;
    isActive?: IsActive;
    createdAt?: CreatedAt;
    failedLoginAttempts?: FailedLoginAttempts;
    lastLoginAt?: LastLoginAt;
  }): User {
    return new User(
      params?.id ?? UserIdMother.random(),
      params?.email ?? EmailMother.random(),
      params?.username ?? UsernameMother.random(),
      params?.masterPasswordHash ?? MasterPasswordHashMother.random(),
      params?.salt ?? SaltMother.random(),
      params?.isActive ?? IsActiveMother.active(),
      params?.createdAt ?? CreatedAtMother.random(),
      params?.failedLoginAttempts ?? FailedLoginAttemptsMother.zero(),
      params?.lastLoginAt ?? LastLoginAtMother.empty()
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

  public static withFailedAttempts(attempts: FailedLoginAttempts): User {
    return this.create({ failedLoginAttempts: attempts });
  }

  public static withLockedAccount(): User {
    return this.create({
      failedLoginAttempts: FailedLoginAttemptsMother.locked(),
    });
  }

  public static withLastLogin(lastLoginAt: LastLoginAt): User {
    return this.create({ lastLoginAt });
  }

  public static withRecentLogin(): User {
    return this.create({ lastLoginAt: LastLoginAtMother.now() });
  }

  public static neverLoggedIn(): User {
    return this.create({
      failedLoginAttempts: FailedLoginAttemptsMother.zero(),
      lastLoginAt: LastLoginAtMother.empty(),
    });
  }

  public static withOneFailedAttempt(): User {
    return this.create({
      failedLoginAttempts: FailedLoginAttemptsMother.one(),
    });
  }

  public static withFourFailedAttempts(): User {
    return this.create({
      failedLoginAttempts: FailedLoginAttemptsMother.four(),
    });
  }
}
