import { Filter } from './Filter';

export class Filters {
  public constructor(public readonly filters: Filter[]) {}

  public isEmpty(): boolean {
    return this.filters.length === 0;
  }
}
