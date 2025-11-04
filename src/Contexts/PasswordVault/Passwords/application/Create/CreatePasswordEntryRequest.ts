/**
 * CreatePasswordEntryRequest DTO
 *
 * Data Transfer Object for creating a new password entry.
 * Contains primitives only - no domain logic.
 *
 * @property userId - The owner of this password entry (from JWT token)
 * @property siteName - The name of the site/app (required)
 * @property siteUrl - The URL of the site (optional)
 * @property username - The username for the site (required)
 * @property password - The password in PLAIN TEXT (will be encrypted)
 * @property category - The category: PERSONAL, WORK, SOCIAL, FINANCIAL, OTHER
 * @property notes - Additional notes (optional, max 1000 chars)
 * @property tags - Array of tags for categorization (optional)
 */
export interface CreatePasswordEntryRequest {
  userId: string;
  siteName: string;
  siteUrl?: string;
  username: string;
  password: string;
  category: string;
  notes?: string;
  tags?: string[];
}
