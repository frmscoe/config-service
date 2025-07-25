// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { Injectable, Logger } from '@nestjs/common';
// import { Collection } from 'arangojs'; // <-- ENSURE THIS LINE IS FULLY REMOVED or properly commented out
import { ArangoDatabaseService } from '../arango-database/arango-database.service';
import { UserEmailMapping } from './user-email-mapping.interface';
import { USER_EMAIL_MAPPING_COLLECTION } from './user-email-mapping.schema';

@Injectable()
export class UserEmailMappingService {
  private readonly logger = new Logger(UserEmailMappingService.name);
  private collection: any; // Using 'any' type for the Collection instance to avoid direct import issues

  constructor(private readonly arangoDatabaseService: ArangoDatabaseService) {
    this.collection = this.arangoDatabaseService.getDatabase().collection(USER_EMAIL_MAPPING_COLLECTION);
  }

  /**
   * Inserts a new mapping or updates an existing one based on clientId.
   * This uses AQL's UPSERT for atomic insert-or-update.
   */
  async upsertMapping(clientId: string, email: string, privileges: string[]): Promise<void> {
    const now = new Date().toISOString();
    try {
      const query = `
        UPSERT { clientId: @clientId }          // Find document by clientId
        INSERT { clientId: @clientId, email: @email, privileges: @privileges, createdAt: @now, updatedAt: @now } // Insert if not found
        UPDATE { email: @email, privileges: @privileges, updatedAt: @now } // Update if found
        IN ${USER_EMAIL_MAPPING_COLLECTION}
        RETURN NEW // Return the new or updated document
      `;
      await this.arangoDatabaseService.getDatabase().query(query, {
        clientId,
        email,
        privileges,
        now,
      });
      this.logger.debug(`Upserted email mapping for clientId: ${clientId}`);
    } catch (error) {
      this.logger.error(`Failed to upsert email mapping for clientId ${clientId}: ${error.message}`, error.stack);
      // You might want to re-throw this error or handle it more specifically in a production app
    }
  }

  /**
   * Retrieves the email and privileges for a given clientId.
   */
  async findByClientId(clientId: string): Promise<UserEmailMapping | null> {
    try {
      const query = `
        FOR doc IN ${USER_EMAIL_MAPPING_COLLECTION}
        FILTER doc.clientId == @clientId
        LIMIT 1 // We expect only one due to the unique index
        RETURN doc
      `;
      const cursor = await this.arangoDatabaseService.getDatabase().query(query, { clientId });
      const result = await cursor.next(); // Get the first (and only) result from the cursor

      return result as UserEmailMapping || null; // Return the document or null if not found
    } catch (error) {
      this.logger.error(`Failed to find email mapping for clientId ${clientId}: ${error.message}`, error.stack);
      return null; // Return null on error
    }
  }
}