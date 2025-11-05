/**
 * PasswordEntryDTO
 *
 * Data Transfer Object representing a single password entry.
 * Contains only primitives for easy serialization.
 *
 * NOTE: The password is returned ENCRYPTED, never in plaintext.
 */
export interface PasswordEntryDTO {
  readonly id: string;
  readonly userId: string;
  readonly siteName: string;
  readonly siteUrl: string | null;
  readonly username: string;
  readonly encryptedPassword: string; // Always encrypted, never plaintext
  readonly category: string;
  readonly notes: string | null;
  readonly tags: string[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * PaginationMetadata
 *
 * Metadata about the pagination state.
 */
export interface PaginationMetadata {
  readonly page: number; // Current page (1-based)
  readonly limit: number; // Items per page
  readonly total: number; // Total items available
  readonly totalPages: number; // Total pages available (calculated)
}

/**
 * ListPasswordEntriesResponse DTO
 *
 * Data Transfer Object for the response of listing password entries.
 * Contains an array of password entry DTOs and pagination metadata.
 *
 * NOTE: This is a simple DTO with NO business logic.
 */
export interface ListPasswordEntriesResponse {
  readonly data: PasswordEntryDTO[];
  readonly pagination: PaginationMetadata;
}
