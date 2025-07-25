// <!-- SPDX-License-Identifier: Apache-2.0 -->
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
import { Rule } from '../rule/entities/rule.entity';
// REMOVED: import { PrivilegeService } from '../privilege/privilege.service'; // NOT needed here for direct checks
// REMOVED: import { RuleConfigPrivilege } from './privilege.constant'; // NOT needed here for direct checks

@Injectable()
export class RuleConfigService {
  constructor(
    private readonly arangoDatabaseService: ArangoDatabaseService,
    private readonly ruleService: RuleService,
    // REMOVED: private readonly privilegeService: PrivilegeService, // NOT injected here
  ) {}

  async create(createRuleConfigDto: CreateRuleConfigDto, req: Request) {
    const db = this.arangoDatabaseService.getDatabase();
    const collection = db.collection(RULE_CONFIG_COLLECTION);

    const ruleExists: Rule = await this.ruleService.findOne(
      createRuleConfigDto.ruleId,
    );
    if (!ruleExists) {
      throw new BadRequestException(
        `No rule found with ID ${createRuleConfigDto.ruleId}`,
      );
    }

    const generatedKey = uuidv4();
    const newRuleConfig: RuleConfig = {
      _key: generatedKey,
      _id: `${RULE_CONFIG_COLLECTION}/${generatedKey}`,
      cfg: createRuleConfigDto.cfg,
      desc: createRuleConfigDto.desc,
      ruleId: createRuleConfigDto.ruleId,
      config: createRuleConfigDto.config || {},
      ownerId: req['user'].username,
      state: StateEnum['01_DRAFT'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updatedBy: req['user'].username,
      originatedID: generatedKey,
    };

    try {
      const result = await collection.save(newRuleConfig);
      return result.new;
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async findAll(page: number, limit: number) {
    const db = this.arangoDatabaseService.getDatabase();
    const aql = `
      FOR doc IN ${RULE_CONFIG_COLLECTION}
      SORT doc.createdAt DESC
      LIMIT ${(page - 1) * limit}, ${limit}
      RETURN doc
    `;
    const cursor = await db.query(aql);
    // FIX: Use .all() instead of .toArray() for ArangoDB cursor
    const ruleConfigs = await cursor.all();


    const countAql = `
      RETURN LENGTH(${RULE_CONFIG_COLLECTION})
    `;
    const countCursor = await db.query(countAql);
    const totalCount = (await countCursor.next()) as number;

    return { data: ruleConfigs, count: totalCount };
  }

  async findOne(id: string): Promise<RuleConfig> {
    const database = this.arangoDatabaseService.getDatabase();
    try {
      const ruleConfig = await database
        .collection(RULE_CONFIG_COLLECTION)
        .document(id);
      return ruleConfig;
    } catch (e) {
      if (e.message.includes('not found')) {
        throw new NotFoundException(`Rule config with id ${id} not found`);
      }
      throw new InternalServerErrorException(e.message);
    }
  }

  async duplicateRuleConfig(
    id: string,
    updateRuleConfigDto: UpdateRuleConfigDto,
    req: Request,
  ): Promise<RuleConfig> {
    const db = this.arangoDatabaseService.getDatabase();
    const collection = db.collection(RULE_CONFIG_COLLECTION);
    const existingRuleConfig: RuleConfig = await this.findOne(id);

    if (
      existingRuleConfig.state === StateEnum['90_APPROVED'] ||
      existingRuleConfig.state === StateEnum['91_RETIRED'] ||
      existingRuleConfig.state === StateEnum['92_DISABLED']
    ) {
      throw new ForbiddenException(
        `Cannot create a new version for rule config with id ${id} as it's in a terminal/non-editable state.`,
      );
    }

    const generatedKey = uuidv4();
    const newRuleConfig: RuleConfig = {
      ...existingRuleConfig,
      _key: generatedKey,
      _id: `${RULE_CONFIG_COLLECTION}/${generatedKey}`,
      cfg: updateRuleConfigDto.cfg || existingRuleConfig.cfg,
      desc: updateRuleConfigDto.desc || existingRuleConfig.desc,
      config: updateRuleConfigDto.config || existingRuleConfig.config,
      state: StateEnum['01_DRAFT'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updatedBy: req['user'].username,
      originatedID: existingRuleConfig.originatedID,
    };

    try {
      const result = await collection.save(newRuleConfig);
      return result.new;
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  // NEW METHOD: For transitioning the state of an existing rule config
  async transitionRuleConfigState(
    id: string,
    newState: StateEnum,
    req: Request,
  ): Promise<RuleConfig> {
    const db = this.arangoDatabaseService.getDatabase();
    const collection = db.collection(RULE_CONFIG_COLLECTION);
    const existingRuleConfig: RuleConfig = await this.findOne(id);

    const currentUserName = req['user'].username;
    const currentState = existingRuleConfig.state;

    // 1. Check if the state is already the requested state
    if (currentState === newState) {
      throw new BadRequestException(
        `Rule config with id ${id} is already in state ${newState}`,
      );
    }

    // 2. Implement your state machine transition logic here.
    // Privilege check is handled by the @Roles decorator in the controller.

    let allowedTransition = false;
    switch (currentState) {
      case StateEnum['01_DRAFT']:
        if (newState === StateEnum['10_PENDING_REVIEW'] || newState === StateEnum['90_ABANDONED']) {
          allowedTransition = true;
        }
        break;
      case StateEnum['10_PENDING_REVIEW']:
        // From PENDING_REVIEW, can go to APPROVED or back to DRAFT
        if (newState === StateEnum['20_APPROVED'] || newState === StateEnum['01_DRAFT']) {
          allowedTransition = true;
        }
        break;
      case StateEnum['20_APPROVED']:
        // From APPROVED, can go to FINAL_APPROVED, RETIRED, or DISABLED
        if (newState === StateEnum['30_DEPLOYED'] || newState === StateEnum['90_APPROVED'] || newState === StateEnum['91_RETIRED'] || newState === StateEnum['92_DISABLED']) {
            allowedTransition = true;
        }
        break;
      case StateEnum['30_DEPLOYED']:
        if (newState == StateEnum['32_RETIRED']){
          allowedTransition = true
        }
        break;
      case StateEnum['32_RETIRED']:
        if (newState == StateEnum['91_ARCHIVED']){
          allowedTransition = true
        }
        break;
      // These are terminal states; no further transitions allowed from them normally.
      case StateEnum['90_APPROVED']:
      case StateEnum['91_RETIRED']:
      case StateEnum['92_DISABLED']:
      case StateEnum['93_MARKED_FOR_DELETION']:
        throw new ForbiddenException(
          `Rule config with id ${id} is in a final state (${currentState}) and cannot be transitioned.`,
        );
      default:
        // Any other unsupported transition
        throw new ForbiddenException(
          `Transition from ${currentState} to ${newState} is not a valid predefined transition.`,
        );
    }

    if (!allowedTransition) {
        throw new ForbiddenException(
            `Transition from ${currentState} to ${newState} is not a permitted transition.`
        );
    }

    // If all checks pass: update the existing document
    try {
      const result = await collection.update(id, {
        state: newState,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUserName,
      });
      return result.new;
    } catch (e) {
      throw new InternalServerErrorException(
        `Failed to update rule config state: ${e.message}`,
      );
    }
  }

  async update(id: string, updateRuleConfigDto: UpdateRuleConfigDto) {
    const database = this.arangoDatabaseService.getDatabase();
    const ruleConfigExists = await database
      .collection(RULE_CONFIG_COLLECTION)
      .documentExists(id);

    if (!ruleConfigExists) {
      throw new NotFoundException(`Rule config with id ${id} not found`);
    }

    try {
      const result = await database
        .collection(RULE_CONFIG_COLLECTION)
        .update(id, updateRuleConfigDto);
      return result.new;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async remove(id: string, req: Request) {
    const database = this.arangoDatabaseService.getDatabase();
    const existingRuleConfig = await this.findOne(id);
    if (existingRuleConfig.state === StateEnum['93_MARKED_FOR_DELETION']) {
      throw new BadRequestException(
        `Rule config with id ${id} already marked for deletion`,
      );
    }

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
    const existingRuleConfig = await this.findOne(id);
    if (existingRuleConfig.state === StateEnum['92_DISABLED']) {
      throw new BadRequestException(
        `Rule config with id ${id} already disabled`,
      );
    }

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