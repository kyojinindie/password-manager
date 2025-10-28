import { UserRegister } from '../../../../../../src/Contexts/Authentication/Users/application/Register/UserRegister';
import { InMemoryUserRepository } from '../../infrastructure/InMemoryUserRepository';
import { MasterPasswordHashingService } from '../../../../../../src/Contexts/Authentication/Users/domain/MasterPasswordHashingService';
import { EmailMother } from '../../../../../mothers/EmailMother';
import { UsernameMother } from '../../../../../mothers/UsernameMother';
import { MasterPasswordMother } from '../../../../../mothers/MasterPasswordMother';

describe('UserRegister', () => {
  let userRegister: UserRegister;
  let userRepository: InMemoryUserRepository;
  let hashingService: MasterPasswordHashingService;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    hashingService = new MasterPasswordHashingService();
    userRegister = new UserRegister(userRepository, hashingService);
  });

  afterEach(() => {
    userRepository.clear();
  });

  it('should register a new user successfully', async () => {
    const request = {
      email: EmailMother.randomValue(),
      username: UsernameMother.randomValue(),
      masterPassword: MasterPasswordMother.strong(),
    };

    const userId = await userRegister.run(request);

    expect(userId).toBeDefined();
    expect(userId.length).toBeGreaterThan(0);

    const savedUser = await userRepository.findByEmail(
      EmailMother.create(request.email)
    );
    expect(savedUser).not.toBeNull();
    expect(savedUser!.email.value).toBe(request.email.toLowerCase());
    expect(savedUser!.username.value).toBe(request.username);
    expect(savedUser!.isActive.value).toBe(true);
  });

  it('should hash the master password before saving', async () => {
    const request = {
      email: EmailMother.randomValue(),
      username: UsernameMother.randomValue(),
      masterPassword: MasterPasswordMother.strong(),
    };

    await userRegister.run(request);

    const savedUser = await userRepository.findByEmail(
      EmailMother.create(request.email)
    );

    expect(savedUser!.masterPasswordHash.value).not.toBe(request.masterPassword);
    expect(savedUser!.masterPasswordHash.value).toMatch(/^\$2[ayb]\$.{56}$/);
  });

  it('should throw error when email already exists', async () => {
    const email = EmailMother.randomValue();
    const firstRequest = {
      email,
      username: UsernameMother.randomValue(),
      masterPassword: MasterPasswordMother.strong(),
    };

    await userRegister.run(firstRequest);

    const duplicateRequest = {
      email,
      username: UsernameMother.randomValue(),
      masterPassword: MasterPasswordMother.strong(),
    };

    await expect(userRegister.run(duplicateRequest)).rejects.toThrow(
      'User with this email already exists'
    );
  });

  it('should throw error when username already exists', async () => {
    const username = UsernameMother.randomValue();
    const firstRequest = {
      email: EmailMother.randomValue(),
      username,
      masterPassword: MasterPasswordMother.strong(),
    };

    await userRegister.run(firstRequest);

    const duplicateRequest = {
      email: EmailMother.randomValue(),
      username,
      masterPassword: MasterPasswordMother.strong(),
    };

    await expect(userRegister.run(duplicateRequest)).rejects.toThrow(
      'User with this username already exists'
    );
  });

  it('should throw error when password is too short', async () => {
    const request = {
      email: EmailMother.randomValue(),
      username: UsernameMother.randomValue(),
      masterPassword: MasterPasswordMother.invalidTooShort(),
    };

    await expect(userRegister.run(request)).rejects.toThrow(
      'Master Password must be at least 12 characters long'
    );
  });

  it('should throw error when password has no uppercase letter', async () => {
    const request = {
      email: EmailMother.randomValue(),
      username: UsernameMother.randomValue(),
      masterPassword: MasterPasswordMother.invalidNoUppercase(),
    };

    await expect(userRegister.run(request)).rejects.toThrow(
      'Master Password must contain at least one uppercase letter'
    );
  });

  it('should throw error when email is invalid', async () => {
    const request = {
      email: EmailMother.invalidFormat(),
      username: UsernameMother.randomValue(),
      masterPassword: MasterPasswordMother.strong(),
    };

    await expect(userRegister.run(request)).rejects.toThrow(
      'Invalid email format'
    );
  });

  it('should throw error when username is too short', async () => {
    const request = {
      email: EmailMother.randomValue(),
      username: UsernameMother.invalidTooShort(),
      masterPassword: MasterPasswordMother.strong(),
    };

    await expect(userRegister.run(request)).rejects.toThrow(
      'Username must be between 3 and 50 characters'
    );
  });
});
