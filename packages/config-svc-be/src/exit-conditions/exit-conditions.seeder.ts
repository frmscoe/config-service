// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ArangoDatabaseService } from '../arango-database/arango-database.service';
import { EXIT_CONDITIONS_COLLECTION, ExitCondition } from './schema/exit-condition.schema';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ExitConditionsSeeder implements OnModuleInit {
  private readonly logger = new Logger(ExitConditionsSeeder.name);
  private db: any; // ArangoDB database instance

  constructor(private readonly arangoDatabaseService: ArangoDatabaseService) {}

  // Make onModuleInit async and await the seed method
  async onModuleInit() {
    this.db = this.arangoDatabaseService.getDatabase();
    await this.seed(); // Ensure seed() is called ONLY AFTER this.db is set
  }

  // Renamed to _seed for internal use if you're calling it from onModuleInit
  // If you are explicitly calling .seed() from main.ts, keep it as 'seed()'
  // For now, I'll assume you keep it public if it's called from main.ts
  async seed() {
    this.logger.log(`Starting seeding of ${EXIT_CONDITIONS_COLLECTION} collection...`);

    const defaultExitConditions: ExitCondition[] = [
      {
        id: '.x00',
        reason: 'Unsuccessful transaction',
        description: 'This condition applies to rule processors that rely on the current transaction being successful. Unsuccessful transactions are often not processed to spare system resources or because the rule processor is unable to function as designed.',
        label: 'System Default',
        isUserDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system',
        updatedBy: 'system',
      },
      {
        id: '.x01',
        reason: 'Insufficient transaction history. At least 50 historical transactions are required',
        description: 'For certain rules, a specific minimum number of historical transactions are required. This exit condition is triggered when the threshold is not met.',
        label: 'System Default',
        isUserDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system',
        updatedBy: 'system',
      },
      {
        id: '.x03',
        reason: 'No variance in transaction history and the volume of recent incoming transactions shows an increase',
        description: 'This condition handles cases where no clear historical trend exists, but recent transactions show a meaningful upturn.',
        label: 'System Default',
        isUserDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system',
        updatedBy: 'system',
      },
      {
        id: '.x04',
        reason: 'No variance in transaction history and the volume of recent incoming transactions is less than or equal to the historical average',
        description: 'Similar to .x03, but handles a meaningful downturn scenario.',
        label: 'System Default',
        isUserDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system',
        updatedBy: 'system',
      },
    ];

    try {
      const collection = this.db.collection(EXIT_CONDITIONS_COLLECTION); // this.db should now be defined
      for (const condition of defaultExitConditions) {
        // Using save with overwriteMode: 'update' is a robust way to handle seeding
        const conditionToSave = { ...condition, _key: condition.id };
        await collection.save(conditionToSave, { overwriteMode: 'update' });
        this.logger.log(`Default exit condition '${condition.id}' seeded/updated successfully.`);
      }
      this.logger.log(`Seeding of ${EXIT_CONDITIONS_COLLECTION} collection completed.`);
    } catch (error) {
      this.logger.error(
        `Failed to seed default exit condition: ${error.message}`,
        error.stack,
      );
      // Re-throw the error to ensure NestJS reports it if critical
      throw error;
    }
  }
}