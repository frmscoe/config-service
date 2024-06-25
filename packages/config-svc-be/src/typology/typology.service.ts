import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ArangoDatabaseService } from '../arango-database/arango-database.service';
import { v4 as uuidv4 } from 'uuid';
import { CreateTypologyDto } from './dto/create-typology.dto';
import { UpdateTypologyDto } from './dto/update-typology.dto';
import { TYPOLOGY_COLLECTION } from './schema/typology.schema';
import { StateEnum } from '../rule/schema/rule.schema';
import { Typology, TypologyRuleWithConfigs } from './entities/typology.entity';

@Injectable()
export class TypologyService {
  constructor(private readonly arangoDatabaseService: ArangoDatabaseService) {}

  async create(
    createTypologyDto: CreateTypologyDto,
    req: Request,
  ): Promise<Typology> {
    const db = this.arangoDatabaseService.getDatabase();
    const collection = db.collection(TYPOLOGY_COLLECTION);

    // check if the username is present in the request
    if (!req['user'].username) {
      throw new BadRequestException(
        'Failed to create typology: username is missing',
      );
    }

    const newTypology: Typology = {
      ...createTypologyDto,
      ownerId: req['user'].username,
      _key: uuidv4(),
      state: StateEnum['01_DRAFT'],
    };

    try {
      const result = await collection.save(newTypology, { returnNew: true });
      return result.new;
    } catch (error) {
      if (error.isArangoError) {
        switch (error.errorNum) {
          case 1620:
            throw new BadRequestException(
              `Failed to create typology: ${error.message}`,
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

  async findAll(options: { page: number; limit: number }): Promise<{
    total: number;
    page: number;
    countInPage: number;
    data: Typology[];
  }> {
    const { page, limit } = options;
    const db = this.arangoDatabaseService.getDatabase();
    const offset: number = (page - 1) * limit;

    // AQL query to fetch both total count and paginated results
    const query = `
    LET totalCount = (FOR typology IN @@collection FILTER typology.edited != @edited COLLECT WITH COUNT INTO length RETURN length)[0]
    LET pageResults = (
      FOR typology IN @@collection
      FILTER typology.edited != @edited
      SORT typology.createdAt ASC
      LIMIT @offset, @limit
      RETURN typology
    )
    RETURN { count: totalCount, page: @page, countInPage: LENGTH(pageResults), data: pageResults }
    `;

    const bindVars = {
      '@collection': TYPOLOGY_COLLECTION,
      edited: true,
      page: page,
      offset: offset,
      limit: limit,
    };

    try {
      const cursor = await db.query(query, bindVars);
      return await cursor.next();
    } catch (e) {
      throw new InternalServerErrorException(
        `Failed to retrieve typologies: ${e.message}`,
      );
    }
  }

  async findOne(id: string): Promise<TypologyRuleWithConfigs> {
    const db = this.arangoDatabaseService.getDatabase();
    const query = `
    FOR typology IN ${TYPOLOGY_COLLECTION}
      FILTER typology._key == @id
      LET ruleWithConfigs = (
        FOR ruleConfig IN typology.rules_rule_configs
          LET rule = DOCUMENT('rule', ruleConfig.ruleId)
          LET configs = (
            FOR configId IN ruleConfig.ruleConfigId
              LET configDocument = DOCUMENT('rule_config', configId)
              RETURN {
                _id: configDocument._id,
                _key: configDocument._key,
                cfg: configDocument.cfg,
                ruleId: configDocument.ruleId,
                config: configDocument.config
              }
          )
          RETURN {
            rule: {
              _id: rule._id,
              _key: rule._key,
              name: rule.name,
              cfg: rule.cfg,
            },
            ruleConfigs: configs
          }
      )
      RETURN MERGE(typology, { ruleWithConfigs: ruleWithConfigs })
  `;
    try {
      const cursor = await db.query(query, { id });
      const result = await cursor.next();
      if (!result) {
        throw new NotFoundException(`No typology found with ID ${id}`);
      }
      return result;
    } catch (e) {
      throw new NotFoundException(`No typology found with ID ${id}`);
    }
  }

  update(id: number, updateTypologyDto: UpdateTypologyDto) {
    return `This action updates a #${id} typology`;
  }

  remove(id: number) {
    return `This action removes a #${id} typology`;
  }
}
