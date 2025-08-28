// <!-- SPDX-License-Identifier: Apache-2.0 -->
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ArangoDatabaseService } from '../arango-database/arango-database.service';
import { v4 as uuidv4 } from 'uuid';
import { CreateTypologyDto } from './dto/create-typology.dto';
import { UpdateTypologyDto } from './dto/update-typology.dto';
import { TYPOLOGY_COLLECTION } from './schema/typology.schema';
import { TypologyStateEnum } from './enums/typology-state.enum'; // Corrected import path for backend
import { Typology, TypologyRuleWithConfigs } from './entities/typology.entity';
import { Request } from 'express';

@Injectable()
export class TypologyService {
  constructor(private readonly arangoDatabaseService: ArangoDatabaseService) {}

  async create(
    createTypologyDto: CreateTypologyDto,
    req: Request,
  ): Promise<Typology> {
    const db = this.arangoDatabaseService.getDatabase();
    const collection = db.collection(TYPOLOGY_COLLECTION);

    const newTypology: Typology = {
      ...createTypologyDto,
      ownerId: req['user'].username ?? '',
      _key: uuidv4(),
      state: TypologyStateEnum['01_DRAFT'], // Use TypologyStateEnum
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const typology = await collection.save(newTypology, { returnNew: true });
      return typology.new;
    } catch (error) {
      if (error.isArangoError) {
        switch (error.errorNum) {
          case 1210:
            throw new BadRequestException(
              `Typology with name '${createTypologyDto.name}' already exists.`,
            );
          default:
            throw new InternalServerErrorException(
              `An unexpected database error occurred: ${error.message}`,
            );
        }
      } else {
        throw new InternalServerErrorException(
          `An unexpected server error occurred: ${error.message}`,
        );
      }
    }
  }

  async findAll({
    page,
    limit,
  }: {
    page: number;
    limit: number;
  }): Promise<{
    total: number;
    page: number;
    countInPage: number;
    data: Typology[];
  }> {
    const db = this.arangoDatabaseService.getDatabase();
    const aql = `
      FOR t IN ${TYPOLOGY_COLLECTION}
      SORT t.createdAt DESC
      LIMIT ${(page - 1) * limit}, ${limit}
      RETURN t
    `;
    const cursor = await db.query(aql);
    const typologies = await cursor.all();

    const countAql = `
      RETURN LENGTH(${TYPOLOGY_COLLECTION})
    `;
    const countCursor = await db.query(countAql);
    const total = (await countCursor.next()) || 0;

    return {
      total,
      page,
      countInPage: typologies.length,
      data: typologies,
    };
  }

  async findOne(id: string): Promise<TypologyRuleWithConfigs> {
    const db = this.arangoDatabaseService.getDatabase();
    const typologyCollection = db.collection(TYPOLOGY_COLLECTION);

    const typology = await typologyCollection.document(id);
    if (!typology) {
      throw new NotFoundException(`Typology with ID ${id} not found.`);
    }

    return { ...typology, rules: [], ruleConfigs: [] };
  }

  // async findOneByName(name: string): Promise<TypologyRuleWithConfigs> {
  //   const db = this.arangoDatabaseService.getDatabase();
  //   // const typologyCollection = db.collection(TYPOLOGY_COLLECTION);

  //   // const typology = await typologyCollection.document(id);
  //   // if (!typology) {
  //   //   throw new NotFoundException(`Typology with ID ${id} not found.`);
  //   // }

  //   // return { ...typology, rules: [], ruleConfigs: [] };
  //   try {
  //     // Query the collection to find the rule by name
  //     const cursor = await db.query(`FOR rule IN ${TYPOLOGY_COLLECTION} FILTER typology.name == @name RETURN typology`, { name });
  //     const result = await cursor.all() 



  //     return result;
  //   } catch (e) {
  //     throw new InternalServerErrorException(e.message);
  //   }
  // }

  async findOneByName(name: string): Promise<TypologyRuleWithConfigs> {
    const db = this.arangoDatabaseService.getDatabase();
    try {
      const cursor = await db.query(`
        FOR typology IN ${TYPOLOGY_COLLECTION}
        FILTER typology.name == @name
        RETURN typology
      `, { name });

      const result = await cursor.next(); //Fetch single result (not array)
      if (!result) throw new NotFoundException(`Typology with name "${name}" not found`);

      return { ...result, rules: [], ruleConfigs: [] }; // Ensure correct return shape
    } catch (e) {
      // throw new InternalServerErrorException(e.message);
      throw new NotFoundException(`Typology with name "${name}" not found`);
    }
  }



  async update(
    id: string,
    updateTypologyDto: UpdateTypologyDto,
  ): Promise<Typology> {
    const db = this.arangoDatabaseService.getDatabase();

    const exists = await db.collection(TYPOLOGY_COLLECTION).documentExists(id);
    if (!exists) {
      throw new NotFoundException(`Typology with ID ${id} not found.`);
    }

    const result = await db
      .collection(TYPOLOGY_COLLECTION)
      .update(id, { ...updateTypologyDto, updatedAt: new Date().toISOString() }, { returnNew: true });
    if (!result) {
      throw new InternalServerErrorException('Failed to update typology.');
    }

    return result.new;
  }

  async transitionTypologyState(
    id: string,
    newState: TypologyStateEnum, // Use TypologyStateEnum
    req: Request,
  ): Promise<Typology> {
    const db = this.arangoDatabaseService.getDatabase();
    const existingTypology = await this.findOne(id);

    try {
      const result = await db.collection(TYPOLOGY_COLLECTION).update(
        id,
        {
          state: newState,
          updatedBy: req['user']?.username,
          updatedAt: new Date().toISOString(),
        },
        { returnNew: true },
      );
      if (!result) {
        throw new InternalServerErrorException('Failed to transition typology state.');
      }
      return result.new;
    } catch (e) {
      throw new BadRequestException(e.message || 'Failed to transition typology state.');
    }
  }

  remove(id: string) {
    return `This action removes a #${id} typology`;
  }

  async addRuleToTypology(typologyId: string, ruleId: string): Promise<Typology> {
    const db = this.arangoDatabaseService.getDatabase();
    const collection = db.collection(TYPOLOGY_COLLECTION);

    const { rules_rule_configs = [], ...rest } = await this.findOne(typologyId);

   
    if (rules_rule_configs.find(entry => entry.ruleId === ruleId)) {
      throw new BadRequestException(`Rule ${ruleId} is already added to the typology`);
    }

    rules_rule_configs.push({ ruleId, ruleConfigId: [] });

    try {
     
      const result = await collection.update(typologyId, {
        ...rest,
        rules_rule_configs,
        updatedAt: new Date().toISOString(),
      }, { returnNew: true });

      return result.new;
    } catch (e) {
      throw new InternalServerErrorException(`Failed to add rule: ${e.message}`);
    }
  }

  // async fetchRuleMetadata(ruleId: string): Promise<{
  //   _id: string;
  //   _key: string;
  //   name: string;
  //   cfg: string;
  // }> {
  //   const db = this.arangoDatabaseService.getDatabase();

  //   try {
  //     const cursor = await db.query(`
  //       FOR rule IN rules
  //       FILTER rule._id == @ruleId
  //       RETURN {
  //         _id: rule._id,
  //         _key: rule._key,
  //         name: rule.name,
  //         cfg: rule.cfg
  //       }
  //     `, { ruleId });

  //     const metadata = await cursor.next();
  //     if (!metadata) {
  //       throw new NotFoundException(`Rule with ID ${ruleId} not found`);
  //     }

  //     return metadata;
  //   } catch (e) {
  //     throw new InternalServerErrorException(`Failed to fetch rule metadata: ${e.message}`);
  //   }
  // }

  // async addAllRuleOutcomes(
  //   typologyId: string,
  //   outcomeRules: Array<{
  //     id: string;
  //     cfg: string;
  //     ref: string;
  //     true: string;
  //     false: string;
  //   }>
  // ): Promise<Typology> {
  //   const db = this.arangoDatabaseService.getDatabase();
  //   const collection = db.collection(TYPOLOGY_COLLECTION);

  //   // Fetch existing typology
  //   const { score = { rules: [], expression: { operator: '', terms: [] } }, ...rest } =
  //     await this.findOne(typologyId);

  //   const existingRuleIds = score.rules?.map((r) => r.id) ?? [];

  //   // Add only new outcomes
  //   const newRules = outcomeRules.filter((r) => !existingRuleIds.includes(r.id));

  //   if (!newRules.length) {
  //     throw new BadRequestException('All provided rule outcomes already exist.');
  //   }

  //   const updatedScore = {
  //     ...score,
  //     rules: [...(score.rules || []), ...newRules],
  //   };

  //   const result = await collection.update(
  //     typologyId,
  //     {
  //       ...rest,
  //       score: updatedScore,
  //       updatedAt: new Date().toISOString(),
  //     },
  //     { returnNew: true }
  //   );

  //   return result.new;
  // }

  async validateRuleConfigReference(ruleConfigIds: string[]): Promise<void> {
    const db = this.arangoDatabaseService.getDatabase();

    const cursor = await db.query(`
      FOR config IN rule_configs
      FILTER config._key IN @ids
      RETURN config._key
    `, { ids: ruleConfigIds });

    const foundIds: string[] = await cursor.all();

    const notFound = ruleConfigIds.filter(id => !foundIds.includes(id));
    if (notFound.length > 0) {
      throw new BadRequestException(`Invalid rule config UUID(s): ${notFound.join(', ')}`);
    }
  }

  async fetchLinkedRules(typologyId: string): Promise<
    Array<{
      rule: any;
      configs: any[];
    }>
  > {
    const db = this.arangoDatabaseService.getDatabase();
    const typology = await this.findOne(typologyId);

    const { rules_rule_configs = [] } = typology;

    const results = [];

    for (const link of rules_rule_configs) {
      const ruleCursor = await db.query(`
        FOR rule IN rules
        FILTER rule._key == @ruleId
        RETURN rule
      `, { ruleId: link.ruleId });

      const rule = await ruleCursor.next();

      const configCursor = await db.query(`
        FOR config IN rule_configs
        FILTER config._key IN @configIds
        RETURN config
      `, { configIds: link.ruleConfigId || [] });

      const configs = await configCursor.all();

      results.push({ rule, configs });
    }

    return results;
  }




}

