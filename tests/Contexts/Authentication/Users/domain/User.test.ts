import { UserMother } from '../../../../mothers/UserMother';
import { UserIdMother } from '../../../../mothers/UserIdMother';

describe('User', () => {
  describe('constructor', () => {
    it('should create a User with all properties', () => {
      const user = UserMother.random();

      expect(user.id).toBeDefined();
      expect(user.email).toBeDefined();
      expect(user.username).toBeDefined();
      expect(user.masterPasswordHash).toBeDefined();
      expect(user.salt).toBeDefined();
      expect(user.isActive).toBeDefined();
      expect(user.createdAt).toBeDefined();
    });

    it('should create an active user by default', () => {
      const user = UserMother.random();

      expect(user.isActive.value).toBe(true);
    });

    it('should set createdAt to current date', () => {
      const user = UserMother.random();
      const now = new Date();

      expect(user.createdAt.value.getTime()).toBeLessThanOrEqual(now.getTime());
    });
  });

  describe('create', () => {
    it('should create a new User with generated id', () => {
      const createParams = UserMother.createParams();

      const user = UserMother.createNew(
        createParams.email,
        createParams.username,
        createParams.masterPasswordHash,
        createParams.salt
      );

      expect(user.id).toBeDefined();
      expect(user.email.equals(createParams.email)).toBe(true);
      expect(user.username.equals(createParams.username)).toBe(true);
      expect(user.masterPasswordHash.equals(createParams.masterPasswordHash)).toBe(
        true
      );
      expect(user.salt.equals(createParams.salt)).toBe(true);
      expect(user.isActive.isTrue()).toBe(true);
    });
  });

  describe('equals', () => {
    it('should return true when comparing users with same id', () => {
      const userId = UserIdMother.random();
      const user1 = UserMother.withId(userId);
      const user2 = UserMother.withId(userId);

      expect(user1.equals(user2)).toBe(true);
    });

    it('should return false when comparing users with different ids', () => {
      const user1 = UserMother.random();
      const user2 = UserMother.random();

      expect(user1.equals(user2)).toBe(false);
    });

    it('should return false when comparing with null', () => {
      const user = UserMother.random();

      expect(user.equals(null as any)).toBe(false);
    });
  });

  describe('toPrimitives', () => {
    it('should return user data as primitives', () => {
      const user = UserMother.random();

      const primitives = user.toPrimitives();

      expect(primitives.id).toBe(user.id.value);
      expect(primitives.email).toBe(user.email.value);
      expect(primitives.username).toBe(user.username.value);
      expect(primitives.masterPasswordHash).toBe(user.masterPasswordHash.value);
      expect(primitives.salt).toBe(user.salt.value);
      expect(primitives.isActive).toBe(user.isActive.value);
      expect(primitives.createdAt).toBe(user.createdAt.value);
    });
  });
});
