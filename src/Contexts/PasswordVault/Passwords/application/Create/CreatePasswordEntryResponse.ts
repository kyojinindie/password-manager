/**
 * CreatePasswordEntryResponse DTO
 *
 * Data Transfer Object for the response of creating a password entry.
 * Returns all relevant information EXCEPT the password (security).
 *
 * @property id - The unique identifier of the created entry
 * @property siteName - The name of the site/app
 * @property siteUrl - The URL of the site (null if not provided)
 * @property username - The username for the site
 * @property category - The category of the entry
 * @property notes - Additional notes (null if not provided)
 * @property tags - Array of tags (empty array if none)
 * @property createdAt - Timestamp when the entry was created
 * @property updatedAt - Timestamp when the entry was last updated
 */
export interface CreatePasswordEntryResponse {
  id: string;
  siteName: string;
  siteUrl: string | null;
  username: string;
  category: string;
  notes: string | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}
