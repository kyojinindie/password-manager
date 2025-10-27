import {
  CriteriaMother,
  FilterMother,
  FiltersMother,
  OrderMother,
} from '../../../../mothers/CriteriaMother';
import {
  FilterOperator,
  OrderType,
} from '../../../../../src/Contexts/Shared/domain/criteria/CriteriaTypes';

describe('Criteria Pattern', () => {
  describe('Filter', () => {
    it('should create a filter with field, operator and value', () => {
      const filter = FilterMother.equal('name', 'John');

      expect(filter.field).toBe('name');
      expect(filter.operator).toBe(FilterOperator.EQUAL);
      expect(filter.value).toBe('John');
    });

    it('should create filter with CONTAINS operator', () => {
      const filter = FilterMother.contains('email', '@example.com');

      expect(filter.operator).toBe(FilterOperator.CONTAINS);
    });
  });

  describe('Filters', () => {
    it('should create empty filters', () => {
      const filters = FiltersMother.empty();

      expect(filters.filters).toHaveLength(0);
      expect(filters.isEmpty()).toBe(true);
    });

    it('should create filters with multiple filter instances', () => {
      const filter1 = FilterMother.equal('name', 'John');
      const filter2 = FilterMother.equal('age', '30');
      const filters = FiltersMother.withFilters([filter1, filter2]);

      expect(filters.filters).toHaveLength(2);
      expect(filters.isEmpty()).toBe(false);
    });
  });

  describe('Order', () => {
    it('should create ascending order', () => {
      const order = OrderMother.asc('createdAt');

      expect(order.orderBy).toBe('createdAt');
      expect(order.orderType).toBe(OrderType.ASC);
      expect(order.isNone()).toBe(false);
    });

    it('should create descending order', () => {
      const order = OrderMother.desc('updatedAt');

      expect(order.orderBy).toBe('updatedAt');
      expect(order.orderType).toBe(OrderType.DESC);
      expect(order.isNone()).toBe(false);
    });

    it('should create none order', () => {
      const order = OrderMother.none();

      expect(order.isNone()).toBe(true);
    });
  });

  describe('Criteria', () => {
    it('should create empty criteria', () => {
      const criteria = CriteriaMother.empty();

      expect(criteria.hasFilters()).toBe(false);
      expect(criteria.hasOrder()).toBe(false);
      expect(criteria.hasPagination()).toBe(false);
    });

    it('should create criteria with filters', () => {
      const filters = FiltersMother.withFilters([FilterMother.equal('name', 'John')]);
      const criteria = CriteriaMother.withFilters(filters);

      expect(criteria.hasFilters()).toBe(true);
    });

    it('should create criteria with order', () => {
      const order = OrderMother.asc('createdAt');
      const criteria = CriteriaMother.withOrder(order);

      expect(criteria.hasOrder()).toBe(true);
    });

    it('should create criteria with pagination', () => {
      const criteria = CriteriaMother.withPagination(20, 40);

      expect(criteria.hasPagination()).toBe(true);
      expect(criteria.limit).toBe(20);
      expect(criteria.offset).toBe(40);
    });

    it('should create complete criteria', () => {
      const filters = FiltersMother.withFilters([FilterMother.equal('status', 'active')]);
      const order = OrderMother.desc('createdAt');
      const criteria = CriteriaMother.create({
        filters,
        order,
        limit: 10,
        offset: 0,
      });

      expect(criteria.hasFilters()).toBe(true);
      expect(criteria.hasOrder()).toBe(true);
      expect(criteria.hasPagination()).toBe(true);
    });
  });
});
