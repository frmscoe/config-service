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
}

