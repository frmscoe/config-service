import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateRuleConfigDto } from './dto/create-rule-config.dto';
import { UpdateRuleConfigDto } from './dto/update-rule-config.dto';
import { Request } from 'express';
import { ArangoDatabaseService } from '../arango-database/arango-database.service';
import { RULE_CONFIG_COLLECTION } from './schema/rule-config.schema';
import { RuleConfig } from './entities/rule-config.entity';
import { v4 as uuidv4 } from 'uuid';
import { StateEnum } from '../rule/schema/rule.schema';
import { RuleService } from '../rule/rule.service';
import { aql } from 'arangojs';
import { Rule } from '../rule/entities/rule.entity';

@Injectable()
export class RuleConfigService {
  constructor(
    private readonly arangoDatabaseService: ArangoDatabaseService,
    private readonly ruleService: RuleService,
  ) {}

  async create(createRuleConfigDto: CreateRuleConfigDto, req: Request) {
    const db = this.arangoDatabaseService.getDatabase();
    const collection = db.collection(RULE_CONFIG_COLLECTION);

    // Ensure the associated rule exists before creating a rule config
    const ruleExists: Rule = await this.ruleService.findOne(
      createRuleConfigDto.ruleId,
    );
    if (!ruleExists) {
      throw new BadRequestException(
        `No rule found with ID ${createRuleConfigDto.ruleId}.`,
      );
    }

    const newRuleConfig = {
      ...createRuleConfigDto,
      ownerId: req['user'].username,
      _key: uuidv4(),
      state: StateEnum['01_DRAFT'],
    };

    try {
      return await collection.save(newRuleConfig);
    } catch (error) {
      throw new BadRequestException(
        `Failed to create rule config: ${error.message}`,
      );
    }
  }

  async findAll(options: {
    page: number;
    limit: number;
  }): Promise<{ count: number; data: RuleConfig[] }> {
    const { limit, page } = options;
    const db = this.arangoDatabaseService.getDatabase();
    const offset = (page - 1) * limit;

    const query = `
    LET result = (
        FOR config IN @@collection
        FILTER config.edited != @edited
        SORT config.createdAt ASC
        LIMIT @offset, @limit
        RETURN config
    )
    LET count = LENGTH(result)
    RETURN { count, data: result }
  `;

    const bindVars = {
      '@collection': RULE_CONFIG_COLLECTION,
      edited: true,
      offset: offset,
      limit: limit,
    };

    try {
      const cursor = await db.query(query, bindVars);
      return await cursor.next();
    } catch (e) {
      throw new InternalServerErrorException(
        `Failed to retrieve rule configurations: ${e.message}`,
      );
    }
  }

  async findOne(id: string): Promise<RuleConfig> {
    const db = this.arangoDatabaseService.getDatabase();
    try {
      return await db.collection(RULE_CONFIG_COLLECTION).document(id);
    } catch (e) {
      throw new NotFoundException(`No rule configuration found with ID ${id}`);
    }
  }

  async duplicateRuleConfig(
    id: string,
    updateRuleConfigDto: UpdateRuleConfigDto,
    req: Request,
  ): Promise<RuleConfig> {
    const db = this.arangoDatabaseService.getDatabase();
    const collection = db.collection(RULE_CONFIG_COLLECTION);

    // Fetch the existing rule configuration to duplicate
    const existingRuleConfig = await this.findOne(id);
    if (!existingRuleConfig) {
      throw new BadRequestException(
        `No rule configuration found with ID ${id}.`,
      );
    }

    // Use AQL to check for existing rule configurations with the same originatedID
    const cursor = await db.query(aql`
        FOR doc IN ${collection}
        FILTER doc.originatedID == ${id}
        RETURN doc
    `);
    const childRuleConfigs = await cursor.all();

    // If a child configuration already exists, throw an exception
    if (childRuleConfigs.length > 0) {
      throw new ForbiddenException(
        `Could not update rule config with id ${id}, rule config is already updated`,
      );
    }

    // Prepare the new rule configuration data
    const { cfg, desc, ruleId, config, ...rest } = existingRuleConfig;
    const newRuleConfig = {
      cfg,
      desc,
      ruleId,
      config,
      ...updateRuleConfigDto,
      _key: uuidv4(),
      originatedID: id,
      state: StateEnum['01_DRAFT'],
      ownerId: req['user'].username,
      updatedBy: req['user'].username,
    };

    // Attempt to save the new rule configuration in the database
    try {
      const ruleConfig: RuleConfig = <RuleConfig>(
        await collection.save(newRuleConfig)
      );
      await this.update(id, { edited: true });
      return this.findOne(ruleConfig._id);
    } catch (e) {
      throw new BadRequestException(
        `Failed to duplicate rule configuration: ${e.message}`,
      );
    }
  }

  async update(
    id: string,
    updateRuleConfigDto: UpdateRuleConfigDto,
  ): Promise<RuleConfig> {
    const db = this.arangoDatabaseService.getDatabase();

    // Check if the rule configuration exists
    const exists = await db
      .collection(RULE_CONFIG_COLLECTION)
      .documentExists(id);
    if (!exists) {
      throw new NotFoundException(
        `Rule configuration with ID ${id} not found.`,
      );
    }

    // Perform the update operation
    const result = await db
      .collection(RULE_CONFIG_COLLECTION)
      .update(id, updateRuleConfigDto, { returnNew: true });
    if (!result) {
      throw new InternalServerErrorException(
        'Failed to update rule configuration.',
      );
    }

    return result.new;
  }

  async remove(id: string, req: Request) {
    const database = this.arangoDatabaseService.getDatabase();

    // check if the rule exists
    const existingRuleConfig = await this.findOne(id);
    if (existingRuleConfig.state === StateEnum['93_MARKED_FOR_DELETION']) {
      throw new BadRequestException(
        `Rule config with id ${id} already marked for deletion`,
      );
    }

    // Save the rule to the database
    try {
      await database.collection(RULE_CONFIG_COLLECTION).update(id, {
        ...existingRuleConfig,
        state: StateEnum['93_MARKED_FOR_DELETION'],
        updatedBy: req['user'].username,
      });
      return;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async disableRuleConfig(id: string, req: Request): Promise<RuleConfig> {
    const db = this.arangoDatabaseService.getDatabase();

    // check if the rule exists
    const existingRuleConfig = await this.findOne(id);
    if (existingRuleConfig.state === StateEnum['92_DISABLED']) {
      throw new BadRequestException(
        `Rule config with id ${id} already disabled`,
      );
    }

    // Save the updated rule to the database
    try {
      await db.collection(RULE_CONFIG_COLLECTION).update(id, {
        ...existingRuleConfig,
        state: StateEnum['92_DISABLED'],
        updatedBy: req['user'].username,
      });
      return await this.findOne(id);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
