import 'dotenv-defaults/config';
import { Injectable, Logger } from '@nestjs/common';
import { Database } from 'arangojs';
import { databaseConfig, systemDatabaseConfig } from './database.config';
import { RULE_COLLECTION, ruleSchema } from '../rule/schema/rule.schema';
import {
  RULE_CONFIG_COLLECTION,
  ruleConfigSchema,
} from '../rule-config/schema/rule-config.schema';
import {
  TYPOLOGY_COLLECTION,
  typologySchema,
} from '../typology/schema/typology.schema';
import {
  NETWORK_MAP_COLLECTION,
  networkMapSchema,
} from '../network-map/schema/network-map.schema';

@Injectable()
export class ArangoDatabaseService {
  private readonly logger = new Logger(ArangoDatabaseService.name);
  private readonly database: Database;
  private readonly systemDatabase: Database;

  constructor() {
    this.database = new Database(databaseConfig);
    this.systemDatabase = new Database(systemDatabaseConfig);
  }

  getDatabase() {
    return this.database;
  }

  async initializeDatabase() {
    try {
      await this.ensureDatabaseExists();
      await this.initializeCollections();
      this.logger.log(`Database '${databaseConfig.databaseName}' is ready.`);
    } catch (error) {
      this.logger.error(
        `Error initializing database: ${error.message}`,
        error.stack,
      );
      throw error; // Rethrow the error to prevent the application from starting
    }
  }

  private async ensureDatabaseExists() {
    const databaseList = await this.systemDatabase.listDatabases();
    if (!databaseList.includes(databaseConfig.databaseName)) {
      this.logger.log(`Creating database '${databaseConfig.databaseName}'...`);
      await this.systemDatabase.createDatabase(databaseConfig.databaseName, [
        {
          username: databaseConfig.auth.username,
          passwd: databaseConfig.auth.password,
        },
      ]);
      this.logger.log(`Database '${databaseConfig.databaseName}' created.`);
    } else {
      this.logger.log(
        `Database '${databaseConfig.databaseName}' already exists.`,
      );
    }
  }

  private async initializeCollections() {
    const collections = [
      { name: RULE_COLLECTION, options: ruleSchema },
      { name: RULE_CONFIG_COLLECTION, options: ruleConfigSchema },
      { name: TYPOLOGY_COLLECTION, options: typologySchema },
      { name: NETWORK_MAP_COLLECTION, options: networkMapSchema },
    ];

    // Iterate over the collection names and create them if they don't exist
    for (const { name, options } of collections) {
      if (!(await this.collectionExists(name))) {
        this.logger.log(`Creating collection '${name}'...`);
        await this.createCollection(name, options);
      } else {
        this.logger.log(`Collection '${name}' already exists.`);
      }
      await this.updateCollectionSchema(name, options.schema);
    }
  }

  private async createCollection(name: string, options: any) {
    try {
      await this.database.createCollection(name, {
        schema: options.schema,
        computedValues: options.computedValues,
      });
      this.logger.log(`Collection '${name}' created.`);
    } catch (error) {
      this.logger.error(
        `Error creating collection '${name}': ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private async collectionExists(collectionName: string): Promise<boolean> {
    const collections = await this.database.listCollections();
    return collections.some((collection) => collection.name === collectionName);
  }

  async updateCollectionSchema(
    collectionName: string,
    newSchema: any,
  ): Promise<void> {
    try {
      const collection = this.database.collection(collectionName);
      await collection.properties({ schema: newSchema });
      this.logger.log(`Schema of collection '${collectionName}' updated.`);
    } catch (error) {
      this.logger.error(
        `Error updating schema of collection '${collectionName}': ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async truncateCollections() {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error(
        'truncateCollections() is only allowed in test environments',
      );
    }
    try {
      const collections = await this.database.collections();
      for (const collection of collections) {
        this.logger.log(`Truncating collection: ${collection.name}`);
        await collection.truncate();
      }
      this.logger.log('All collections have been truncated.');
    } catch (error) {
      this.logger.error(
        `Error truncating collections: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
