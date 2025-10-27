import { Filters } from './Filters';
import { Order } from './Order';

export class Criteria {
  public constructor(
    public readonly filters: Filters,
    public readonly order: Order,
    public readonly limit?: number,
    public readonly offset?: number
  ) {}

  public hasFilters(): boolean {
    return !this.filters.isEmpty();
  }

  public hasOrder(): boolean {
    return !this.order.isNone();
  }

  public hasPagination(): boolean {
    return this.limit !== undefined || this.offset !== undefined;
  }
}
