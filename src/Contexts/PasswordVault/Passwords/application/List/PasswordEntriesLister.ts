import { PasswordEntryRepository } from '../../domain/PasswordEntryRepository';
import { PasswordEntry } from '../../domain/PasswordEntry';
import { ListPasswordEntriesRequest } from './ListPasswordEntriesRequest';
import {
  ListPasswordEntriesResponse,
  PasswordEntryDTO,
  PaginationMetadata,
} from './ListPasswordEntriesResponse';

/**
 * PasswordEntriesLister - Application Service (Use Case)
 *
 * Orchestrates the operation of listing password entries for a user with
 * pagination, sorting, and filtering capabilities.
 *
 * Responsibilities (Orchestration Only):
 * 1. Accept request DTO with listing criteria
 * 2. Apply default values for pagination and sorting
 * 3. Delegate to repository for data retrieval
 * 4. Calculate pagination metadata
 * 5. Map domain objects to DTOs
 * 6. Return response DTO
 *
 * This service contains NO BUSINESS LOGIC:
 * - Business rules are in the domain layer (PasswordEntry aggregate)
 * - Data access is delegated to repository (port)
 * - Only orchestrates the flow and transforms data
 *
 * Following Single Responsibility Principle:
 * - This service handles ONLY the "list password entries" operation
 * - Other operations (create, update, delete) have their own services
 */
export class PasswordEntriesLister {
  // Default values for pagination and sorting
  private static readonly DEFAULT_PAGE = 1;
  private static readonly DEFAULT_LIMIT = 20;
  private static readonly DEFAULT_SORT_BY = 'siteName';
  private static readonly DEFAULT_SORT_ORDER = 'asc';

  public constructor(
    // Dependency injection: Repository port (interface)
    // The infrastructure layer will provide the concrete implementation
    private readonly passwordEntryRepository: PasswordEntryRepository
  ) {}

  /**
   * Executes the "list password entries" use case.
   *
   * Flow:
   * 1. Extract and apply default values from request
   * 2. Retrieve password entries from repository with criteria
   * 3. Get total count for pagination metadata
   * 4. Calculate pagination metadata (totalPages)
   * 5. Map domain aggregates to DTOs
   * 6. Return response with data and metadata
   *
   * @param request - The listing request with criteria
   * @returns Promise with the response containing data and pagination metadata
   */
  public async run(
    request: ListPasswordEntriesRequest
  ): Promise<ListPasswordEntriesResponse> {
    // Step 1: Extract parameters and apply defaults
    const page = request.page ?? PasswordEntriesLister.DEFAULT_PAGE;
    const limit = request.limit ?? PasswordEntriesLister.DEFAULT_LIMIT;
    const sortBy = request.sortBy ?? PasswordEntriesLister.DEFAULT_SORT_BY;
    const sortOrder = request.sortOrder ?? PasswordEntriesLister.DEFAULT_SORT_ORDER;
    const category = request.category;

    // Step 2: Delegate to repository to find password entries with criteria
    // The repository handles the actual data access (infrastructure concern)
    const passwordEntries = await this.passwordEntryRepository.findByUserIdWithCriteria(
      request.userId,
      page,
      limit,
      sortBy,
      sortOrder,
      category
    );

    // Step 3: Get total count for pagination metadata
    // Pass the same category filter to get accurate count
    const total = await this.passwordEntryRepository.countByUserId(
      request.userId,
      category
    );

    // Step 4: Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const paginationMetadata: PaginationMetadata = {
      page,
      limit,
      total,
      totalPages,
    };

    // Step 5: Map domain aggregates to DTOs
    // This is simple data transformation, not business logic
    const data = passwordEntries.map(entry => this.mapToDTO(entry));

    // Step 6: Return response DTO
    return {
      data,
      pagination: paginationMetadata,
    };
  }

  /**
   * Maps a PasswordEntry domain aggregate to a PasswordEntryDTO.
   *
   * This is simple data transformation using the aggregate's toPrimitives() method.
   * No business logic here - just converting from domain representation to DTO.
   *
   * @param passwordEntry - Domain aggregate to map
   * @returns PasswordEntryDTO with primitive values
   */
  private mapToDTO(passwordEntry: PasswordEntry): PasswordEntryDTO {
    // Use the domain aggregate's toPrimitives() method
    // This ensures consistency in how domain objects are serialized
    const primitives = passwordEntry.toPrimitives();

    return {
      id: primitives.id,
      userId: primitives.userId,
      siteName: primitives.siteName,
      siteUrl: primitives.siteUrl,
      username: primitives.username,
      encryptedPassword: primitives.encryptedPassword, // Always encrypted
      category: primitives.category,
      notes: primitives.notes,
      tags: primitives.tags,
      createdAt: primitives.createdAt,
      updatedAt: primitives.updatedAt,
    };
  }
}
