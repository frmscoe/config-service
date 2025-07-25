// <!-- SPDX-License-Identifier: Apache-2.0 -->
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ArangoDatabaseService } from 'src/arango-database/arango-database.service';
import { PrivilegeService } from 'src/privilege/privilege.service';
import { UserEmailMappingService } from 'src/user-mapping/user-email-mapping.service';
import { CreateExitConditionDto } from './dto/create-exit-condition.dto';
import { ExitConditionResponseDto } from './dto/exit-condition-response.dto'; // Import the new DTO
import { UpdateExitConditionDto } from './dto/update-exit-condition.dto'; // make sure this import exists
import {
  EXIT_CONDITIONS_COLLECTION,
  ExitCondition,
} from './schema/exit-condition.schema';
import {
  USER_EXIT_DEFAULTS_COLLECTION,
  UserExitDefault,
} from './schema/user-exit-default.schema';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ExitConditionsService {
  constructor(
    private readonly arangoDbService: ArangoDatabaseService,
    private readonly UserEmailMappingService: UserEmailMappingService,
    private readonly privilegeService: PrivilegeService,
  ) {}

  

  private _mapToExitConditionDto(
  exitCondition: ExitCondition,
    usersWithThisDefault?: number,
  ): ExitConditionResponseDto {
    const isSystemDefault = exitCondition.label === 'System Default';
    // A condition is considered user-defined if its label is not 'System Default'
    // and its ID does not start with '.x' (for hardcoded system defaults)
    const isUserDefined = !isSystemDefault && !exitCondition.id.startsWith('.x');

    return {
      ...exitCondition,
      isSystemDefault: isSystemDefault,
      // Keep the original isUserDefault from exitCondition, as it's now authoritative from DTO/Seeder
      // We can optionally derive 'isUserDefault' based on 'isSystemDefault' and 'isUserDefined' as a fallback
      // or simply use exitCondition.isUserDefault if that's the source of truth for user-defined status
      isUserDefault: exitCondition.isUserDefault, // Use the stored value
      userDefined: isUserDefined, // This still correctly reflects if it's user-definable based on system rules
      canDelete: isUserDefined && (usersWithThisDefault ?? 0) === 0,
    };
  }

  async findAll(token: string): Promise<ExitConditionResponseDto[]> {
    const claims = await this.privilegeService.validateTokenAndClaims(token, [
      'EXIT_COND_GET_ALL',
    ]);
    if (!claims.valid) {
      throw new BadRequestException('Insufficient privileges');
    }

    const collection = await this.getCollection(EXIT_CONDITIONS_COLLECTION);
    const userDefaultsCollection = await this.getCollection(
      USER_EXIT_DEFAULTS_COLLECTION,
    );

    const query = `
      FOR ec IN ${EXIT_CONDITIONS_COLLECTION}
      LET usersWithThisDefault = (
        FOR ud IN ${USER_EXIT_DEFAULTS_COLLECTION}
        FILTER ud.defaultExitConditionId == ec.id
        RETURN 1
      )
      RETURN {
        _key: ec._key,
        id: ec.id,
        reason: ec.reason,
        description: ec.description,
        label: ec.label,
        createdAt: ec.createdAt,
        updatedAt: ec.updatedAt,
        createdBy: ec.createdBy,
        updatedBy: ec.updatedBy,
        usersWithThisDefault: COUNT(usersWithThisDefault),
        isUserDefault: ec.isUserDefault
      }
    `;

    const cursor = await this.arangoDbService.getDatabase().query(query);
    const exitConditions = await cursor.all();

    // Fetch all user defaults once to optimize
    const userDefaultsQuery = `FOR ud IN ${USER_EXIT_DEFAULTS_COLLECTION} RETURN ud`;
    const userDefaultsCursor = await this.arangoDbService
      .getDatabase()
      .query(userDefaultsQuery);
    const allUserDefaults = await userDefaultsCursor.all();

    return exitConditions.map((ec) =>
      this._mapToExitConditionDto(
        ec,
        allUserDefaults.filter((ud) => ud.defaultExitConditionId === ec.id).length,
      ),
    );
  }

  async findOne(id: string, token: string): Promise<ExitConditionResponseDto> {
    const claims = await this.privilegeService.validateTokenAndClaims(token, [
      'EXIT_COND_GET_BY_ID',
    ]);
    if (!claims.valid) {
      throw new BadRequestException('Insufficient privileges');
    }

    const collection = await this.getCollection(EXIT_CONDITIONS_COLLECTION);

    let exitCondition: ExitCondition;
    try {
      exitCondition = await collection.document(id);
    } catch (error) {
      if (error.response && error.response.statusCode === 404) {
        throw new NotFoundException(`Exit condition with ID "${id}" not found.`);
      }
      throw error;
    }

    const usersWithThisDefaultQuery = `
      FOR ud IN ${USER_EXIT_DEFAULTS_COLLECTION}
      FILTER ud.defaultExitConditionId == @exitConditionId
      RETURN 1
    `;
    const cursor = await this.arangoDbService
      .getDatabase()
      .query(usersWithThisDefaultQuery, { exitConditionId: id });
    const usersWithThisDefault = (await cursor.all()).length;

    return this._mapToExitConditionDto(exitCondition, usersWithThisDefault);
  }

  async create(
    createExitConditionDto: CreateExitConditionDto,
    token: string,
    req: Request,
  ): Promise<ExitConditionResponseDto> {
    const claims = await this.privilegeService.validateTokenAndClaims(token, [
      'EXIT_COND_CREATE_USER',
    ]);
    if (!claims.valid) {
      throw new BadRequestException('Insufficient privileges');
    }

    const collection = await this.getCollection(EXIT_CONDITIONS_COLLECTION);
    const now = new Date().toISOString();
    const username = req['user'].username;

    
    const isUserDefaultNormalized = typeof createExitConditionDto.isUserDefault === 'boolean'
      ? createExitConditionDto.isUserDefault
      : String(createExitConditionDto.isUserDefault).toLowerCase() === 'true';

    console.log('Received isUserDefault:', createExitConditionDto.isUserDefault);
    console.log('Normalized isUserDefault:', isUserDefaultNormalized);

    const newExitCondition: ExitCondition = {
      id: createExitConditionDto.id,
      reason: createExitConditionDto.reason,
      description: createExitConditionDto.description,
      label: createExitConditionDto.label || 'User Created',
      isUserDefault: isUserDefaultNormalized, // forcibly parsed as real boolean
      createdAt: now,
      updatedAt: now,
      createdBy: username,
      updatedBy: username,
    };


    let documentToSave: any = { ...newExitCondition };

    // If exitId is provided in the DTO, use it as the ArangoDB _key
    // Otherwise, _key will be auto-generated by ArangoDB because we don't set it explicitly.
    if (createExitConditionDto.exitId) {
      documentToSave._key = createExitConditionDto.exitId;
    }

    try {
      const meta = await collection.save(documentToSave, {
        overwriteMode: 'ignore',
      });
      const savedCondition = await collection.document(meta._key);
      return this._mapToExitConditionDto(savedCondition, 0);
    } catch (error) {
      // Handle conflict if a document with the provided _key (from exitId) already exists
      if (error.code === 1210 && createExitConditionDto.exitId) {
        throw new ConflictException(
          `Exit condition with provided exitId "${createExitConditionDto.exitId}" already exists.`,
        );
      }
      // Handle conflict if a unique index (like 'reason') already exists
      if (error.response && error.response.errorNum === 1210 && error.response.errorMessage.includes('reason')) {
        throw new ConflictException(
          `Exit condition with reason "${createExitConditionDto.reason}" already exists.`,
        );
      }
      throw error;
    }
  }

  
  async update(
  id: string,
  dto: UpdateExitConditionDto,
  token: string,
  req: Request,
): Promise<ExitConditionResponseDto> {
  const claims = await this.privilegeService.validateTokenAndClaims(token, [
    'EXIT_COND_SET_USER_DEFAULT',
  ]);
  if (!claims.valid) {
    throw new BadRequestException('Insufficient privileges');
  }

  const collection = await this.getCollection(EXIT_CONDITIONS_COLLECTION);
  const existingCondition = await collection.document(id).catch(() => {
    throw new NotFoundException(`Exit condition with ID "${id}" not found.`);
  });

  if (existingCondition.label === 'System Default' || existingCondition.id.startsWith('.x')) {
    throw new BadRequestException(
      `System Default exit condition with ID "${id}" cannot be updated.`,
    );
  }

  const username = req['user'].username;
  const now = new Date().toISOString();

  const updatedExitCondition: Partial<ExitCondition> = {
    reason: dto.reason ?? existingCondition.reason,
    description: dto.description ?? existingCondition.description,
    label: dto.label ?? existingCondition.label,
    isUserDefault: dto.isUserDefault ?? existingCondition.isUserDefault,
    updatedAt: now,
    updatedBy: username,
  };

  try {
    await collection.update(id, updatedExitCondition);
    const updated = await collection.document(id);
    return this._mapToExitConditionDto(updated, 0);
  } catch (error) {
    throw new BadRequestException(error.message);
  }
}



  async remove(id: string, token: string): Promise<void> {
    const claims = await this.privilegeService.validateTokenAndClaims(token, [
      'EXIT_COND_DELETE_USER',
    ]);
    if (!claims.valid) {
      throw new BadRequestException('Insufficient privileges');
    }

    const collection = await this.getCollection(EXIT_CONDITIONS_COLLECTION);
    const existingCondition = await collection.document(id).catch(() => {
      throw new NotFoundException(`Exit condition with ID "${id}" not found.`);
    });

    // Prevent deletion of System Default conditions or conditions starting with .x
    if (existingCondition.label === 'System Default' || existingCondition.id.startsWith('.x')) {
      throw new BadRequestException(
        `System Default exit condition with ID "${id}" cannot be deleted.`,
      );
    }

    const userDefaultsCollection = await this.getCollection(
      USER_EXIT_DEFAULTS_COLLECTION,
    );
    const usersWithThisDefaultQuery = `
      FOR ud IN ${USER_EXIT_DEFAULTS_COLLECTION}
      FILTER ud.defaultExitConditionId == @exitConditionId
      RETURN 1
    `;
    const cursor = await this.arangoDbService
      .getDatabase()
      .query(usersWithThisDefaultQuery, { exitConditionId: id });
    const usersWithThisDefault = (await cursor.all()).length;

    if (usersWithThisDefault > 0) {
      throw new BadRequestException(
        `Exit condition with ID "${id}" cannot be deleted as it is currently set as a default for ${usersWithThisDefault} user(s).`,
      );
    }

    await collection.remove(id);
  }

  async setDefaultExitConditionForUser(
    ownerId: string,
    exitConditionId: string,
    token: string,
  ): Promise<UserExitDefault> {
    const claims = await this.privilegeService.validateTokenAndClaims(token, [
      'EXIT_COND_SET_USER_DEFAULT',
    ]);
    if (!claims.valid) {
      throw new BadRequestException('Insufficient privileges');
    }

    const exitConditionsCollection = await this.getCollection(EXIT_CONDITIONS_COLLECTION);
    try {
      await exitConditionsCollection.document(exitConditionId);
    } catch (error) {
      if (error.response && error.response.statusCode === 404) {
        throw new NotFoundException(
          `Exit condition with ID "${exitConditionId}" not found.`,
        );
      }
      throw error;
    }

    const userDefaultsCollection = await this.getCollection(USER_EXIT_DEFAULTS_COLLECTION);
    const timestamp = new Date().toISOString();

    const newUserDefault: UserExitDefault = {
      ownerId,
      defaultExitConditionId: exitConditionId,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const userDefaultDocumentToSave = { ...newUserDefault, _key: ownerId };
    const meta = await userDefaultsCollection.save(userDefaultDocumentToSave, {
      overwriteMode: 'replace',
    });

    return { ...newUserDefault, _key: meta._key };
  }

  async getDefaultExitConditionForUser(ownerId: string, token: string): Promise<ExitConditionResponseDto | null> {
    const claims = await this.privilegeService.validateTokenAndClaims(token, ['EXIT_COND_GET_USER_DEFAULT']);
    if (!claims.valid) {
      throw new BadRequestException('Insufficient privileges');
    }

    const userDefaultsCollection = await this.getCollection(USER_EXIT_DEFAULTS_COLLECTION);
    let userDefault: UserExitDefault;
    try {
      userDefault = await userDefaultsCollection.document(ownerId);
    } catch (error) {
      if (error.response && error.response.statusCode === 404) {
        return null;
      }
      throw error;
    }

    const exitConditionsCollection = await this.getCollection(EXIT_CONDITIONS_COLLECTION);
    try {
      const exitCondition = await exitConditionsCollection.document(userDefault.defaultExitConditionId);
      return this._mapToExitConditionDto(exitCondition);
    } catch (error) {
      if (error.response && error.response.statusCode === 404) {
        throw new NotFoundException(`The default exit condition with ID "${userDefault.defaultExitConditionId}" for user "${ownerId}" was not found. It might have been deleted.`);
      }
      throw error;
    }
  }

  private async getCollection(collectionName: string) {
    const db = this.arangoDbService.getDatabase();
    return db.collection(collectionName);
  }
}