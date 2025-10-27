import { OrderType } from './CriteriaTypes';

export class Order {
  public constructor(
    public readonly orderBy: string,
    public readonly orderType: OrderType
  ) {}

  public isNone(): boolean {
    return this.orderType === OrderType.NONE;
  }
}
