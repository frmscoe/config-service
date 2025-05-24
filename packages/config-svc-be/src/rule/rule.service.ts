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

    const newRule = {
      ...createRuleDto,
      ownerId: req['user'].username,
      _key: uuidv4(),
      state: StateEnum['01_DRAFT'],
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

    const newRule = {
      cfg: createRuleAndRuleConfigDto.rule_cfg,
      name: createRuleAndRuleConfigDto.name,
      desc: createRuleAndRuleConfigDto.rule_desc,
      dataType: createRuleAndRuleConfigDto.dataType,
      ownerId: req['user'].username,
      _key: uuidv4(),
      state: StateEnum['01_DRAFT'],
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

  // async findAll(options: {
  //   page: number;
  //   limit: number;
  // }): Promise<{ count: number; rules: Rule[] }> {
  //   const { limit, page } = options;
  //   const db = this.arangoDatabaseService.getDatabase();
  //   const skip = (page - 1) * limit;

  //   const query = `
  //   LET count = LENGTH(FOR doc IN @@collection FILTER doc.edited != @edited RETURN doc)
  //   LET rules = (
  //       FOR rule IN @@collection
  //       FILTER rule.edited != @edited
  //       SORT rule.createdAt ASC
  //       LIMIT @skip, @limit
  //       RETURN rule
  //   )
  //   RETURN { count, rules }
  // `;

  //   const bindVars = {
  //     '@collection': RULE_COLLECTION,
  //     edited: true,
  //     skip: skip,
  //     limit: limit,
  //   };

  //   try {
  //     const cursor = await db.query(query, bindVars);
  //     return await cursor.next();
  //   } catch (e) {
  //     throw new InternalServerErrorException(
  //       `Failed to retrieve rules: ${e.message}`,
  //     );
  //   }
  // }

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

  // async findRuleConfigsByName(ruleName: string): Promise<RuleWithConfig> {
  //   const db = this.arangoDatabaseService.getDatabase();
  //   const query = `
  //   FOR rule IN @@collection
  //   FILTER rule.name == @name
  //   LET configurations = (
  //     FOR config IN @@configCollection
  //     FILTER config.ruleId == rule._id
  //     RETURN MERGE(config, {
  //       config: {
  //         parameters: config.parameters,
  //         exitConditions: config.exitConditions,
  //         bands: config.bands,
  //         cases: config.cases
  //       }
  //     })
  //   )
  //   RETURN MERGE(rule, { ruleConfigs: configurations })
  // `;

  //   const bindVars = {
  //     '@collection': RULE_COLLECTION,
  //     '@configCollection': RULE_CONFIG_COLLECTION,
  //     name: ruleName,
  //   };

  //   try {
  //     const cursor = await db.query(query, bindVars);
  //     return await cursor.next();
  //   } catch (e) {
  //     throw new InternalServerErrorException(
  //       `Failed to retrieve configurations for rule named ${ruleName}: ${e.message}`,
  //     );
  //   }
  // }

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

    // save rule to the database
    try {
      const rule = await collection.save({
        ...rest,
        ...updateRuleDto,
        _key: uuid,
        originatedID: id,
        updatedBy: req['user'].username,
      });
      await this.update(id, { edited: true });
      return this.findOne(rule._id);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async update(id: string, updateRuleDto: any): Promise<Rule> {
    try {
      const db = this.arangoDatabaseService.getDatabase();
      const rule = await db
        .collection(RULE_COLLECTION)
        .update(id, updateRuleDto, { returnNew: true });
      return rule.new;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string, req: Request) {
    const db = this.arangoDatabaseService.getDatabase();

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
        updatedBy: req['user'].username,
      });
      return;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async disableRule(id: string, req: Request): Promise<Rule> {
    const db = this.arangoDatabaseService.getDatabase();

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
        updatedBy: req['user'].username,
      });
      return await this.findOne(id);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
