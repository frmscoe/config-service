// <!-- SPDX-License-Identifier: Apache-2.0 -->
import 'dotenv-defaults/config';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
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
import { USER_EMAIL_MAPPING_COLLECTION, userEmailMappingSchema } from '../user-mapping/user-email-mapping.schema';
// --- NEW IMPORTS FOR EXIT CONDITIONS ---
import { EXIT_CONDITIONS_COLLECTION, exitConditionSchema } from '../exit-conditions/schema/exit-condition.schema';
import { USER_EXIT_DEFAULTS_COLLECTION, userExitDefaultSchema } from '../exit-conditions/schema/user-exit-default.schema';


// --- NEW INTERFACE FOR COLLECTION CONFIG ---
export interface ArangoDbCollectionConfig {
  name: string;
  schema: any; // The actual schema object for ArangoDB validation
  ensureUniqueIndex?: { field: string; collectionName: string }[];
}


@Injectable()
export class ArangoDatabaseService implements OnModuleInit {
  private readonly logger = new Logger(ArangoDatabaseService.name);
  private readonly database: Database;
  private readonly systemDatabase: Database;

  constructor() {
    this.database = new Database(databaseConfig);
    this.systemDatabase = new Database(systemDatabaseConfig);
  }

  async onModuleInit() {
    await this.initializeDatabase();
  }

  getDatabase(): Database {
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
      throw error;
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
    const collections: ArangoDbCollectionConfig[] = [ // Use the new interface
      { name: RULE_COLLECTION, schema: ruleSchema.schema },
      { name: RULE_CONFIG_COLLECTION, schema: ruleConfigSchema.schema },
      { name: TYPOLOGY_COLLECTION, schema: typologySchema.schema },
      { name: NETWORK_MAP_COLLECTION, schema: networkMapSchema.schema },
      {
        name: USER_EMAIL_MAPPING_COLLECTION,
        schema: userEmailMappingSchema.schema,
        ensureUniqueIndex: [{ field: 'clientId', collectionName: USER_EMAIL_MAPPING_COLLECTION }]
      },
      // --- ADD NEW COLLECTIONS HERE ---
      { name: EXIT_CONDITIONS_COLLECTION, schema: exitConditionSchema, // Note: Assuming .rule is the top-level schema as in your existing schemas
        ensureUniqueIndex: [{ field: 'id', collectionName: EXIT_CONDITIONS_COLLECTION }]
      },
      { name: USER_EXIT_DEFAULTS_COLLECTION, schema: userExitDefaultSchema, // Note: Assuming .rule is the top-level schema
        ensureUniqueIndex: [{ field: 'ownerId', collectionName: USER_EXIT_DEFAULTS_COLLECTION }]
      },
    ];

    for (const config of collections) { // Iterate using the config object
      if (!(await this.collectionExists(config.name))) {
        this.logger.log(`Creating collection '${config.name}'...`);
        await this.createCollection(config.name, config.schema);
      } else {
        this.logger.log(`Collection '${config.name}' already exists.`);
      }
      // Update schema.
      await this.updateCollectionSchema(config.name, config.schema);

      // Ensure unique indexes if specified in the config
      if (config.ensureUniqueIndex) {
        for (const indexConfig of config.ensureUniqueIndex) {
          await this.ensureUniqueIndex(indexConfig.collectionName, indexConfig.field);
        }
      }
    }
  }

  private async createCollection(name: string, schema: any) {
    try {
      await this.database.createCollection(name, {
        schema: schema,
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

  private async ensureUniqueIndex(collectionName: string, field: string): Promise<void> {
    try {
      const collection = this.database.collection(collectionName);
      const indexes = await collection.indexes();
      const indexExists = indexes.some(
        (index: any) =>
          index.fields && index.fields.includes(field) && index.unique
      );

      if (!indexExists) {
        await collection.ensureIndex({
          type: 'persistent',
          fields: [field],
          unique: true,
        });
        this.logger.log(`Unique index on '${field}' created for collection '${collectionName}'.`);
      } else {
        this.logger.log(`Unique index on '${field}' already exists for collection '${collectionName}'.`);
      }
    } catch (error) {
      this.logger.error(`Error ensuring unique index on '${field}' for collection '${collectionName}': ${error.message}`, error.stack);
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