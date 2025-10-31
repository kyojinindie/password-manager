import { MasterPasswordHashingService } from '../../src/Contexts/Authentication/Users/domain/MasterPasswordHashingService';

export class MockMasterPasswordHashingService extends MasterPasswordHashingService {
  private readonly predefinedHash: string;
  private readonly shouldVerifySucceed: boolean;

  public constructor(
    predefinedHash: string = 'mocked-hash',
    shouldVerifySucceed: boolean = true
  ) {
    super();
    this.predefinedHash = predefinedHash;
    this.shouldVerifySucceed = shouldVerifySucceed;
  }

  public static withSuccessfulVerification(): MockMasterPasswordHashingService {
    return new MockMasterPasswordHashingService('mocked-hash', true);
  }

  public static withFailedVerification(): MockMasterPasswordHashingService {
    return new MockMasterPasswordHashingService('mocked-hash', false);
  }

  public static withCustomHash(hash: string): MockMasterPasswordHashingService {
    return new MockMasterPasswordHashingService(hash, true);
  }

  public async hash(_password: string): Promise<string> {
    return Promise.resolve(this.predefinedHash);
  }

  public async verify(_password: string, _hash: string): Promise<boolean> {
    return Promise.resolve(this.shouldVerifySucceed);
  }

  public async generateSalt(): Promise<string> {
    return Promise.resolve('mocked-salt');
  }
}
