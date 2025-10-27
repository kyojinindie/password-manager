import { AggregateRootMother } from '../../../mothers/AggregateRootMother';

describe('AggregateRoot', () => {
  describe('instantiation', () => {
    it('should create an aggregate root instance', () => {
      const aggregate = AggregateRootMother.create();

      expect(aggregate).toBeDefined();
      expect(aggregate.id).toBeDefined();
      expect(aggregate.value).toBeDefined();
    });

    it('should create aggregate with specific id', () => {
      const id = 'test-id-123';
      const aggregate = AggregateRootMother.withId(id);

      expect(aggregate.id).toBe(id);
    });

    it('should create aggregate with specific value', () => {
      const value = 'test-value';
      const aggregate = AggregateRootMother.withValue(value);

      expect(aggregate.value).toBe(value);
    });
  });

  describe('behavior', () => {
    it('should allow updating aggregate state', () => {
      const aggregate = AggregateRootMother.create();
      const newValue = 'updated-value';

      aggregate.updateValue(newValue);

      expect(aggregate.value).toBe(newValue);
    });

    it('should maintain identity after state changes', () => {
      const aggregate = AggregateRootMother.create();
      const originalId = aggregate.id;

      aggregate.updateValue('new-value');

      expect(aggregate.id).toBe(originalId);
    });
  });
});
