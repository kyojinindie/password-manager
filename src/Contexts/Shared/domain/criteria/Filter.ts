import { FilterOperator } from './CriteriaTypes';

export class Filter {
  public constructor(
    public readonly field: string,
    public readonly operator: FilterOperator,
    public readonly value: string
  ) {}
}
