// <!-- SPDX-License-Identifier: Apache-2.0 -->
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateRuleDto } from './dto/create-rule.dto';
import { UpdateRuleDto } from './dto/update-rule.dto';
import { ArangoDatabaseService } from '../arango-database/arango-database.service';
import { Request } from 'express';
import { Rule, RuleWithConfig } from './entities/rule.entity';
import { RuleConfig } from '../rule-config/entities/rule-config.entity';
import { RULE_COLLECTION, StateEnum } from './schema/rule.schema';
import { v4 as uuidv4 } from 'uuid';
import { RULE_CONFIG_COLLECTION } from '../rule-config/schema/rule-config.schema';
import { CreateRuleAndRuleConfigDto } from './dto/create-rule-and-rule-config.dto';

@Injectable()
export class RuleService {
  constructor(private readonly arangoDatabaseService: ArangoDatabaseService) {}

  async create(createRuleDto: CreateRuleDto, req: Request) {
    const db = this.arangoDatabaseService.getDatabase();
    const collection = db.collection(RULE_COLLECTION);
    const now = new Date().toISOString(); // Get current timestamp
    const username = req['user'].username; // Get username from request

    // Check for existing rule with same name and cfg
    const existing = await collection.firstExample({
      name: createRuleDto.name,
      cfg: createRuleDto.cfg,
    }).catch(() => null); // Avoid crash if none exists

    if (existing) {
      throw new BadRequestException('Rule already exists');
    }

    const newRule = {
      ...createRuleDto,
      ownerId: username,
      _key: uuidv4(),
      state: StateEnum['01_DRAFT'],
      createdAt: now, // Set creation timestamp
      updatedAt: now, // Set initial update timestamp
      updatedBy: username, // Set initial updater
    };

    try {
      return await collection.save(newRule);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

    async createRuleAndRuleConfig(createRuleAndRuleConfigDto: CreateRuleAndRuleConfigDto, req: Request) {
    const db = this.arangoDatabaseService.getDatabase();
    const ruleCollection = db.collection(RULE_COLLECTION);
    const ruleConfigCollection = db.collection(RULE_CONFIG_COLLECTION);
    const now = new Date().toISOString(); // Get current timestamp
    const username = req['user'].username; // Get username from request

    const newRule = {
      cfg: createRuleAndRuleConfigDto.rule_cfg,
      name: createRuleAndRuleConfigDto.name,
      desc: createRuleAndRuleConfigDto.rule_desc,
      dataType: createRuleAndRuleConfigDto.dataType,
      ownerId: username,
      _key: uuidv4(),
      state: StateEnum['01_DRAFT'],
      createdAt: now, // Set creation timestamp
      updatedAt: now, // Set initial update timestamp
      updatedBy: username, // Set initial updater
      }
    const newRuleConfig = {
      cfg: createRuleAndRuleConfigDto.rule_config_cfg,
      desc: createRuleAndRuleConfigDto.rule_config_desc,
      config: createRuleAndRuleConfigDto.config,
      ownerId: req['user'].username,
      _key: uuidv4(),
      state: StateEnum['01_DRAFT']
    }
    try {
      // Insert the new document into the 'rule' collection;
      const rule = await ruleCollection.save({
        ...newRule,
      });
      // Insert the new document into the 'rule-config' collection;
      const ruleConfig = await ruleConfigCollection.save({
        ...newRuleConfig,
        ruleId: rule._key,
      });
      return { rule, ruleConfig };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  

  async findAll(options: {
    page: number;
    limit: number;
    desc?: string;
    name?: string;
    cfg?: string;
    state?: string;
    ownerId?: string;
  }): Promise<{ count: number; rules: Rule[] }> {
    const { limit, page, desc, name, cfg, state, ownerId } = options;
    const db = this.arangoDatabaseService.getDatabase();
    const skip = (page - 1) * limit;

    const filters = [`rule.edited != true`];

    // if (desc) filters.push(`CONTAINS(LOWER(rule.desc), LOWER(@desc))`);
    if (desc) filters.push(`CONTAINS(LOWER(rule.\`desc\`), LOWER(@desc))`);
    if (name) filters.push(`CONTAINS(LOWER(rule.name), LOWER(@name))`);
    if (cfg) filters.push(`CONTAINS(LOWER(rule.cfg), LOWER(@cfg))`);
    if (state) filters.push(`rule.state == @state`);
    if (ownerId) filters.push(`rule.ownerId == @ownerId`);

    const filterClause = filters.length ? `FILTER ${filters.join(' AND ')}` : '';

    const query = `
      LET count = LENGTH(
        FOR rule IN @@collection
          ${filterClause}
          RETURN rule
      )
      LET rules = (
        FOR rule IN @@collection
          ${filterClause}
          SORT rule.createdAt ASC
          LIMIT @skip, @limit
          RETURN rule
      )
      RETURN { count, rules }
    `;

    const bindVars: Record<string, any> = {
      '@collection': RULE_COLLECTION,
      skip,
      limit,
    };
    if (desc) bindVars['desc'] = desc;
    if (name) bindVars['name'] = name;
    if (cfg) bindVars['cfg'] = cfg;
    if (state) bindVars['state'] = state;
    if (ownerId) bindVars['ownerId'] = ownerId;

    try {
      const cursor = await db.query(query, bindVars);
      return await cursor.next();
    } catch (e) {
      throw new InternalServerErrorException(`Failed to retrieve rules: ${e.message}`);
    }
  }


  async findRuleConfigs(options: {
    page: number;
    limit: number;
  }): Promise<{ count: number; rules: RuleConfig[] }> {
    const { limit, page } = options;
    const db = this.arangoDatabaseService.getDatabase();
    const skip = (page - 1) * limit;

    const query = `
    LET count = LENGTH(FOR doc IN @@collection FILTER doc.edited != @edited RETURN doc)
    LET rules = (
        FOR rule IN @@collection
        FILTER rule.edited != @edited
        SORT rule.createdAt ASC
        LIMIT @skip, @limit
        LET configurations = (
            FOR config IN @@configCollection
            FILTER config.ruleId == rule._id
            RETURN config
        )
        RETURN MERGE(rule, { ruleConfigs: configurations })
    )
    RETURN { count, rules }
  `;

    const bindVars = {
      '@collection': RULE_COLLECTION,
      '@configCollection': RULE_CONFIG_COLLECTION,
      edited: true,
      skip: skip,
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

  

    async findRuleConfigsByName(ruleName: string): Promise<{ rule: RuleConfig; ruleConfigs: RuleConfig[] }> {
    const db = this.arangoDatabaseService.getDatabase();
    const query = `
      FOR rule IN @@collection
      FILTER rule.name == @name
      LET configurations = (
        FOR config IN @@configCollection
        FILTER config.ruleId == rule._id
        RETURN config
      )
      RETURN { rule, ruleConfigs: configurations }
    `;

    const bindVars = {
      '@collection': RULE_COLLECTION,
      '@configCollection': RULE_CONFIG_COLLECTION,
      'name': ruleName
    };

    try {
      const cursor = await db.query(query, bindVars);
      return await cursor.next();
    } catch (e) {
      throw new InternalServerErrorException(
        `Failed to retrieve configurations for rule named ${ruleName}: ${e.message}`,
      );
    }
  }  



  async findOne(id: string): Promise<Rule> {
    const db = this.arangoDatabaseService.getDatabase();

    try {
      return await db.collection(RULE_COLLECTION).document(id);
    } catch (e) {
      throw new NotFoundException(`rule with id ${id} not found`);
    }
  }

    async findOneByName(name: string): Promise<Rule[]> {
    const db = this.arangoDatabaseService.getDatabase();

    try {
      // Query the collection to find the rule by name
      const cursor = await db.query(`FOR rule IN ${RULE_COLLECTION} FILTER rule.name == @name RETURN rule`, { name });
      const result = await cursor.all() 



      return result;
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async duplicateRule(
    id: string,
    updateRuleDto: UpdateRuleDto,
    req: Request,
  ): Promise<Rule> {
    const db = this.arangoDatabaseService.getDatabase();
    const collection = db.collection(RULE_COLLECTION);
    const username = req['user'].username; // Get username from request

    // check if the rule exists
    const existingRule = await this.findOne(id);

    // check if rule is already edited
    const childRule = await collection.byExample({ originatedID: id });
    if (childRule.count > 0) {
      throw new ForbiddenException(
        `Could not update rule with id ${id}, rule is already updated`,
      );
    }

    const uuid = uuidv4();
    const { _key, _id, _rev, ...rest } = existingRule;
    const now = new Date().toISOString(); // Get current timestamp

    // save rule to the database
    try {
      const rule = await collection.save({
        ...rest,
        ...updateRuleDto,
        _key: uuid,
        originatedID: id,
        updatedBy: username, // Set updater
        createdAt: now, // Set creation timestamp for duplicated rule
        updatedAt: now, // Set update timestamp for duplicated rule
      });
      await this.update(id, { edited: true }); // This update call will also set updatedAt for the original rule
      return this.findOne(rule._id);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async update(id: string, updateRuleDto: any): Promise<Rule> {
    try {
      const db = this.arangoDatabaseService.getDatabase();
      const now = new Date().toISOString(); // Get current timestamp
      // Note: 'req' is not passed to this method, so 'updatedBy' cannot be set directly here.
      // If 'updatedBy' is required for all updates, 'req' needs to be passed from the controller.
      const rule = await db
        .collection(RULE_COLLECTION)
        .update(id, {
            ...updateRuleDto,
            updatedAt: now, // Update timestamp
            // updatedBy: req['user'].username, // Uncomment and pass 'req' if needed
        }, { returnNew: true });
      return rule.new;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string, req: Request) {
    const db = this.arangoDatabaseService.getDatabase();
    const username = req['user'].username; // Get username from request

    // check if the rule exists
    const existingRule = await this.findOne(id);
    if (existingRule.state === StateEnum['93_MARKED_FOR_DELETION']) {
      throw new BadRequestException(
        `Rule with id ${id} already marked for deletion`,
      );
    }

    // Save the rule to the database
    try {
      await db.collection(RULE_COLLECTION).update(id, {
        ...existingRule,
        state: StateEnum['93_MARKED_FOR_DELETION'],
        updatedBy: username, // Set updater
        updatedAt: new Date().toISOString(), // Consider adding updatedAt here too if state change counts as update
      });
      return;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async disableRule(id: string, req: Request): Promise<Rule> {
    const db = this.arangoDatabaseService.getDatabase();
    const username = req['user'].username; // Get username from request

    // check if the rule exists
    const existingRule = await this.findOne(id);
    if (existingRule.state === StateEnum['92_DISABLED']) {
      throw new BadRequestException(`Rule with id ${id} already disabled`);
    }

    // Save the updated rule to the database
    try {
      await db.collection(RULE_COLLECTION).update(id, {
        ...existingRule,
        state: StateEnum['92_DISABLED'],
        updatedBy: username, // Set updater
        updatedAt: new Date().toISOString(), // Consider adding updatedAt here too
      });
      return await this.findOne(id);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async updateStateOnly(id: string, newState: string, req: Request) {
    const db = this.arangoDatabaseService.getDatabase();
    const collection = db.collection(RULE_COLLECTION);
    const username = req['user'].username; // Get username from request

    const existing = await collection.document(id).catch(() => {
      throw new NotFoundException(`Rule with ID ${id} not found`);
    });

    try {
      await collection.update(id, {
        state: newState,
        updatedBy: username, // Already correctly sets updatedBy
        updatedAt: new Date().toISOString(), // Already correctly sets updatedAt
      });

      return await collection.document(id);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  /**
   * Parses a rule identifier of the format "ruleId@version".
   * @param compositeId - The composite ID string
   * @returns An object with ruleId and version
   */
  parseRuleId(compositeId: string): { ruleId: string; version: string } {
    if (!compositeId.includes('@')) {
      throw new BadRequestException('Invalid composite rule ID format');
    }

    const [ruleId, version] = compositeId.split('@');

    if (!ruleId || !version) {
      throw new BadRequestException('Both rule ID and version must be present');
    }

    return { ruleId, version };
  }


  /**
   * Bumps the version string (e.g., "1.2.3") by incrementing minor or patch version.
   * @param currentVersion - The current version string
   * @param level - "minor" or "patch"
   */
  bumpVersion(currentVersion: string, level: 'minor' | 'patch'): string {
    const parts = currentVersion.split('.').map(Number);
    if (parts.length !== 3) {
      throw new BadRequestException(`Invalid version format: ${currentVersion}`);
    }

    if (level === 'minor') {
      parts[1] += 1; // bump minor
      parts[2] = 0;  // reset patch
    } else if (level === 'patch') {
      parts[2] += 1;
    } else {
      throw new BadRequestException(`Unsupported bump level: ${level}`);
    }

    return parts.join('.');
  }

  /**
   * Validates whether the provided ID is a valid UUID.
   * @param id - UUID string
   */
  validateRuleUUID(id: string): void {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(id)) {
      throw new BadRequestException(`Invalid UUID format: ${id}`);
    }
  }


}