import { IsActive } from '../../src/Contexts/Authentication/Users/domain/IsActive';

export class IsActiveMother {
  public static create(value: boolean): IsActive {
    return new IsActive(value);
  }

  public static active(): IsActive {
    return new IsActive(true);
  }

  public static inactive(): IsActive {
    return new IsActive(false);
  }
}
