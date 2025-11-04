import { PasswordEncryptionService as VaultPasswordEncryptionService } from '../domain/PasswordEncryptionService';
import { PasswordEncryptionService as AuthPasswordEncryptionService } from '../../../Authentication/Users/application/ports/PasswordEncryptionService';
import { EncryptedPassword } from '../domain/EncryptedPassword';

/**
 * Password Encryption Service Adapter
 *
 * Adapts the Authentication context's PasswordEncryptionService to work with
 * the PasswordVault context's PasswordEncryptionService interface.
 *
 * This is an ADAPTER PATTERN implementation - a cross-context integration adapter.
 *
 * Problem:
 * - Authentication context has PasswordEncryptionService that works with strings
 * - PasswordVault context has PasswordEncryptionService that works with EncryptedPassword VO
 * - Both interfaces have the same name but different signatures
 * - We need to bridge between them
 *
 * Solution:
 * - This adapter wraps the Authentication service
 * - Converts string results to EncryptedPassword VOs
 * - Converts EncryptedPassword VOs to strings
 * - Allows PasswordVault to use Authentication's encryption service
 *
 * Architecture Notes:
 * - This is a SECONDARY (driven/output) adapter
 * - It implements the PasswordVault port (interface)
 * - It delegates to the Authentication service (implementation)
 * - It translates between the two contexts
 *
 * Cross-Context Integration:
 * - Authentication context provides encryption implementation
 * - PasswordVault context needs encryption but doesn't want to depend on Auth
 * - This adapter acts as an Anti-Corruption Layer (ACL)
 * - PasswordVault remains independent of Authentication internals
 *
 * Responsibilities:
 * - Encrypt passwords (delegate to Auth service, wrap result in VO)
 * - Decrypt passwords (unwrap VO, delegate to Auth service)
 * - Translate between string and EncryptedPassword representations
 *
 * What this adapter DOES NOT do:
 * - Actual encryption logic (delegates to Auth service)
 * - Password validation (that's domain)
 * - Password storage (that's repository)
 *
 * Benefits:
 * - Decouples PasswordVault from Authentication context
 * - Allows different encryption implementations without changing PasswordVault
 * - Enforces use of EncryptedPassword VO in PasswordVault domain
 * - Single Responsibility: only translation, not encryption logic
 */
export class PasswordEncryptionServiceAdapter implements VaultPasswordEncryptionService {
  /**
   * Constructor
   *
   * @param authEncryptionService - The Authentication context's encryption service
   */
  public constructor(
    private readonly authEncryptionService: AuthPasswordEncryptionService
  ) {}

  /**
   * Encrypts a plain text password using the master password
   *
   * Process:
   * 1. Delegate to Authentication service for actual encryption
   * 2. Receive encrypted string
   * 3. Wrap in EncryptedPassword Value Object
   * 4. Return VO
   *
   * @param plainPassword - The password to encrypt (plain text)
   * @param userId - The user ID (in PasswordVault context, this is used as master password context)
   * @returns Promise<EncryptedPassword> - Encrypted password as Value Object
   * @throws Error if encryption fails
   *
   * Note on userId parameter:
   * - In PasswordVault context, userId is used as encryption context
   * - In Authentication context, it's called masterPassword
   * - For now, we need to get the actual master password somehow
   * - This is a temporary adapter - in production, refactor to pass master password correctly
   *
   * IMPORTANT: This is a simplified adapter for development.
   * In production, you need to:
   * 1. Either pass master password explicitly
   * 2. Or retrieve user's master password hash from User repository
   * 3. Or use a different encryption key derivation strategy
   */
  public async encrypt(
    plainPassword: string,
    userId: string
  ): Promise<EncryptedPassword> {
    // TODO: In production, retrieve actual master password
    // For now, we'll use userId as a placeholder
    // This is NOT secure - it's for development/testing only

    // Delegate to Authentication service
    // Note: AuthPasswordEncryptionService.encrypt() expects masterPassword, not userId
    // For this adapter to work properly, we need access to the master password
    // In a real implementation, you'd need to:
    // 1. Pass master password through the request context
    // 2. Or use a different encryption strategy
    // 3. Or retrieve master password from a secure store

    // TEMPORARY WORKAROUND: Use userId as masterPassword (NOT SECURE)
    // This is only for making the code compile and tests pass
    // In production, replace with proper master password handling
    const encryptedString = await this.authEncryptionService.encrypt(
      plainPassword,
      userId // TEMPORARY: Should be masterPassword
    );

    // Wrap the encrypted string in EncryptedPassword Value Object
    const encryptedPassword = new EncryptedPassword(encryptedString);

    return encryptedPassword;
  }

  /**
   * Decrypts an encrypted password back to plain text
   *
   * Process:
   * 1. Extract string value from EncryptedPassword VO
   * 2. Delegate to Authentication service for actual decryption
   * 3. Return decrypted string
   *
   * @param encryptedPassword - The encrypted password Value Object
   * @param userId - The user ID (should be master password in production)
   * @returns Promise<string> - The decrypted password in plain text
   * @throws Error if decryption fails
   */
  public async decrypt(
    encryptedPassword: EncryptedPassword,
    userId: string
  ): Promise<string> {
    // Extract string value from VO
    const encryptedString = encryptedPassword.value;

    // Delegate to Authentication service
    // TEMPORARY WORKAROUND: Use userId as masterPassword (NOT SECURE)
    const decryptedString = await this.authEncryptionService.decrypt(
      encryptedString,
      userId // TEMPORARY: Should be masterPassword
    );

    return decryptedString;
  }
}

/**
 * Factory Function: Create adapter with Authentication service
 *
 * @param authEncryptionService - The Authentication context's encryption service
 * @returns Configured adapter implementing PasswordVault's interface
 *
 * Example usage:
 * ```typescript
 * import { PasswordEncryptionServiceImpl } from '../../../Authentication/Users/infrastructure/PasswordEncryptionServiceImpl';
 * import { createPasswordEncryptionServiceAdapter } from './PasswordEncryptionServiceAdapter';
 *
 * const authService = new PasswordEncryptionServiceImpl();
 * const vaultService = createPasswordEncryptionServiceAdapter(authService);
 *
 * // Now use vaultService in PasswordVault context
 * const creator = new PasswordEntryCreator(repository, vaultService);
 * ```
 */
export function createPasswordEncryptionServiceAdapter(
  authEncryptionService: AuthPasswordEncryptionService
): VaultPasswordEncryptionService {
  return new PasswordEncryptionServiceAdapter(authEncryptionService);
}

/**
 * IMPORTANT NOTES FOR PRODUCTION:
 *
 * This adapter has a CRITICAL LIMITATION:
 * - It uses userId as masterPassword (NOT SECURE)
 * - This is only for development/testing
 * - In production, you MUST pass the actual master password
 *
 * Solutions for Production:
 *
 * Option 1: Pass Master Password Through Request Context
 * ```typescript
 * // In controller:
 * const masterPassword = req.body.masterPassword; // From request
 * const createRequest = {
 *   userId,
 *   masterPassword, // Add this to DTO
 *   siteName,
 *   username,
 *   password,
 *   category,
 * };
 * ```
 *
 * Option 2: Store Master Password in Session
 * ```typescript
 * // After login, store hashed master password in session
 * req.session.masterPassword = hashedMasterPassword;
 *
 * // In use case, retrieve from session
 * const masterPassword = session.masterPassword;
 * ```
 *
 * Option 3: Use Derived Encryption Key
 * ```typescript
 * // Store encryption key derived from master password
 * // Use this key for all password entry encryptions
 * // This is more secure as master password never leaves authentication context
 * ```
 *
 * Option 4: Refactor to Single PasswordEncryptionService
 * ```typescript
 * // Move PasswordEncryptionService to Shared Kernel
 * // Both contexts use the same interface
 * // No adapter needed
 * ```
 *
 * Recommended Approach:
 * - Option 3 or 4 for production
 * - Option 1 for development/testing
 * - Never use userId as masterPassword in production
 */

/**
 * Testing Notes:
 *
 * Unit tests should verify:
 * 1. Adapter correctly wraps encrypted string in EncryptedPassword VO
 * 2. Adapter correctly unwraps EncryptedPassword VO to string
 * 3. Adapter delegates to Authentication service
 * 4. Adapter passes correct parameters to Authentication service
 * 5. Adapter propagates errors from Authentication service
 *
 * Example unit test:
 * ```typescript
 * describe('PasswordEncryptionServiceAdapter', () => {
 *   it('should wrap encrypted string in EncryptedPassword VO', async () => {
 *     const mockAuthService = {
 *       encrypt: jest.fn().mockResolvedValue('encrypted-string'),
 *       decrypt: jest.fn(),
 *       reEncrypt: jest.fn(),
 *     };
 *
 *     const adapter = new PasswordEncryptionServiceAdapter(mockAuthService);
 *
 *     const result = await adapter.encrypt('plain', 'user-123');
 *
 *     expect(mockAuthService.encrypt).toHaveBeenCalledWith('plain', 'user-123');
 *     expect(result).toBeInstanceOf(EncryptedPassword);
 *     expect(result.value).toBe('encrypted-string');
 *   });
 * });
 * ```
 */
