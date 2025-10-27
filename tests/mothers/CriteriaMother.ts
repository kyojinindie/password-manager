import { faker } from '@faker-js/faker';
import { Criteria } from '../../src/Contexts/Shared/domain/criteria/Criteria';
import { Filters } from '../../src/Contexts/Shared/domain/criteria/Filters';
import { Filter } from '../../src/Contexts/Shared/domain/criteria/Filter';
import { Order } from '../../src/Contexts/Shared/domain/criteria/Order';
import {
  FilterOperator,
  OrderType,
} from '../../src/Contexts/Shared/domain/criteria/CriteriaTypes';

export class FilterMother {
  static create(params?: {
    field?: string;
    operator?: FilterOperator;
    value?: string;
  }): Filter {
    return new Filter(
      params?.field ?? faker.database.column(),
      params?.operator ?? FilterOperator.EQUAL,
      params?.value ?? faker.lorem.word()
    );
  }

  static random(): Filter {
    const operators = Object.values(FilterOperator);
    return new Filter(
      faker.database.column(),
      operators[Math.floor(Math.random() * operators.length)],
      faker.lorem.word()
    );
  }

  static equal(field: string, value: string): Filter {
    return new Filter(field, FilterOperator.EQUAL, value);
  }

  static contains(field: string, value: string): Filter {
    return new Filter(field, FilterOperator.CONTAINS, value);
  }
}

export class FiltersMother {
  static create(filters?: Filter[]): Filters {
    return new Filters(filters ?? [FilterMother.random()]);
  }

  static empty(): Filters {
    return new Filters([]);
  }

  static withFilters(filters: Filter[]): Filters {
    return new Filters(filters);
  }

  static random(count: number = 3): Filters {
    const filters: Filter[] = [];
    for (let i = 0; i < count; i++) {
      filters.push(FilterMother.random());
    }
    return new Filters(filters);
  }
}

export class OrderMother {
  static create(params?: { orderBy?: string; orderType?: OrderType }): Order {
    return new Order(
      params?.orderBy ?? faker.database.column(),
      params?.orderType ?? OrderType.ASC
    );
  }

  static random(): Order {
    const types = Object.values(OrderType);
    return new Order(
      faker.database.column(),
      types[Math.floor(Math.random() * types.length)]
    );
  }

  static asc(orderBy: string): Order {
    return new Order(orderBy, OrderType.ASC);
  }

  static desc(orderBy: string): Order {
    return new Order(orderBy, OrderType.DESC);
  }

  static none(): Order {
    return new Order('', OrderType.NONE);
  }
}

export class CriteriaMother {
  static create(params?: {
    filters?: Filters;
    order?: Order;
    limit?: number;
    offset?: number;
  }): Criteria {
    return new Criteria(
      params?.filters ?? FiltersMother.empty(),
      params?.order ?? OrderMother.none(),
      params?.limit,
      params?.offset
    );
  }

  static random(): Criteria {
    return new Criteria(
      FiltersMother.random(),
      OrderMother.random(),
      faker.number.int({ min: 1, max: 100 }),
      faker.number.int({ min: 0, max: 100 })
    );
  }

  static empty(): Criteria {
    return new Criteria(FiltersMother.empty(), OrderMother.none());
  }

  static withFilters(filters: Filters): Criteria {
    return new Criteria(filters, OrderMother.none());
  }

  static withOrder(order: Order): Criteria {
    return new Criteria(FiltersMother.empty(), order);
  }

  static withPagination(limit: number, offset: number): Criteria {
    return new Criteria(FiltersMother.empty(), OrderMother.none(), limit, offset);
  }
}
