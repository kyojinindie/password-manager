import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * PasswordEntry TypeORM Entity
 *
 * This is the PERSISTENCE MODEL (infrastructure layer).
 * It represents how PasswordEntry data is stored in the database.
 *
 * Architecture Notes:
 * - This is NOT a domain entity - it's a database mapping
 * - This class is INTERNAL to infrastructure - never exposed outside
 * - The mapper translates between this and domain PasswordEntry aggregate
 * - Column names follow database conventions (snake_case)
 * - All validations are in domain layer, NOT here
 *
 * Separation of Concerns:
 * - Domain Entity: Rich behavior, business rules, immutability
 * - Persistence Entity: Database mapping, ORM annotations, primitives
 *
 * Why separate models?
 * - Domain evolves based on business needs
 * - Database evolves based on performance/schema needs
 * - Changing one doesn't force changing the other
 * - Easy to swap ORMs or databases
 *
 * Table Structure:
 * - password_entries (table name)
 * - Stores encrypted passwords (NOT plain text)
 * - Uses JSON for tags array (PostgreSQL JSONB recommended in production)
 * - Timestamps managed by TypeORM
 *
 * ESLint Suppression:
 * - TypeORM decorators use 'any' types internally, which is outside our control
 * - We suppress warnings for decorator lines only
 */
/* eslint-disable @typescript-eslint/no-unsafe-call */
@Entity('password_entries')
export class PasswordEntryEntity {
  /**
   * Primary Key - UUID
   * Maps to PasswordEntryId value object in domain
   */
  @PrimaryColumn('uuid')
  public id!: string;

  /**
   * User ID - Foreign Key to users table
   * Maps to userId primitive string in domain
   *
   * Note: We store userId as primitive (not UserId VO) because
   * PasswordVault context is separate from Authentication context.
   * This is a cross-context reference using primitive obsession intentionally.
   */
  @Column({ name: 'user_id', type: 'uuid' })
  public userId!: string;

  /**
   * Site Name
   * Maps to SiteName value object in domain
   *
   * Examples: "GitHub", "Gmail", "Facebook"
   * Max length enforced in domain (100 chars)
   */
  @Column({ name: 'site_name', type: 'varchar', length: 100 })
  public siteName!: string;

  /**
   * Site URL (optional)
   * Maps to SiteUrl value object in domain
   *
   * Examples: "https://github.com", "https://mail.google.com"
   * Nullable - user may not always have a URL
   * Max length: 2048 chars (standard URL max length)
   */
  @Column({ name: 'site_url', type: 'varchar', length: 2048, nullable: true })
  public siteUrl!: string | null;

  /**
   * Username for the site
   * Maps to Username value object in domain
   *
   * Examples: "john.doe@email.com", "johndoe123"
   * Max length enforced in domain (100 chars)
   */
  @Column({ name: 'username', type: 'varchar', length: 100 })
  public username!: string;

  /**
   * Encrypted Password
   * Maps to EncryptedPassword value object in domain
   *
   * Security Notes:
   * - This is ALWAYS encrypted (AES-256-GCM)
   * - Never stored in plain text
   * - Encrypted with user's master password
   * - Format: "iv:authTag:encryptedData" (base64 encoded)
   * - Approximate length: 200-500 chars depending on password length
   */
  @Column({ name: 'encrypted_password', type: 'text' })
  public encryptedPassword!: string;

  /**
   * Category
   * Maps to Category value object in domain
   *
   * Allowed values (enforced in domain):
   * - PERSONAL
   * - WORK
   * - SOCIAL
   * - FINANCIAL
   * - OTHER
   *
   * Stored as VARCHAR instead of ENUM for flexibility
   * (easier to add categories without schema migration)
   */
  @Column({ name: 'category', type: 'varchar', length: 20 })
  public category!: string;

  /**
   * Notes (optional)
   * Maps to Notes value object in domain
   *
   * Free text field for user notes about the password entry
   * Max length: 1000 chars (enforced in domain)
   * Nullable - notes are optional
   */
  @Column({ name: 'notes', type: 'varchar', length: 1000, nullable: true })
  public notes!: string | null;

  /**
   * Tags
   * Maps to Tags value object (collection of Tag VOs) in domain
   *
   * Stored as JSON array of strings
   * Examples: ["important", "work", "2fa-enabled"]
   *
   * TypeORM Notes:
   * - Uses 'simple-json' type (stored as TEXT with JSON.stringify/parse)
   * - In production with PostgreSQL, consider using 'jsonb' for better performance
   * - Empty array if no tags
   *
   * Migration to JSONB for PostgreSQL:
   * @Column({ name: 'tags', type: 'jsonb', default: '[]' })
   */
  @Column({ name: 'tags', type: 'simple-json' })
  public tags!: string[];

  /**
   * Created At Timestamp
   * Maps to CreatedAt value object in domain
   *
   * Automatically set by TypeORM on insert
   * Immutable - never changes after creation
   */
  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  public createdAt!: Date;

  /**
   * Updated At Timestamp
   * Maps to UpdatedAt value object in domain
   *
   * Automatically updated by TypeORM on every update
   */
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  public updatedAt!: Date;
}
/* eslint-enable @typescript-eslint/no-unsafe-call */

/**
 * Database Migration Notes:
 *
 * When creating the table, use this schema:
 *
 * ```sql
 * CREATE TABLE password_entries (
 *   id UUID PRIMARY KEY,
 *   user_id UUID NOT NULL,
 *   site_name VARCHAR(100) NOT NULL,
 *   site_url VARCHAR(2048),
 *   username VARCHAR(100) NOT NULL,
 *   encrypted_password TEXT NOT NULL,
 *   category VARCHAR(20) NOT NULL,
 *   notes VARCHAR(1000),
 *   tags JSON NOT NULL DEFAULT '[]',
 *   created_at TIMESTAMP NOT NULL DEFAULT NOW(),
 *   updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
 *   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
 * );
 *
 * -- Indexes for performance
 * CREATE INDEX idx_password_entries_user_id ON password_entries(user_id);
 * CREATE INDEX idx_password_entries_category ON password_entries(category);
 * CREATE INDEX idx_password_entries_created_at ON password_entries(created_at DESC);
 * ```
 *
 * PostgreSQL optimization:
 * - Use JSONB instead of JSON for tags column
 * - Add GIN index on tags for efficient searching: CREATE INDEX idx_password_entries_tags ON password_entries USING GIN(tags);
 */
