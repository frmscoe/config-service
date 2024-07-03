import { Test, TestingModule } from '@nestjs/testing';
import { RuleConfigService } from './rule-config.service';
import { ArangoDatabaseService } from '../arango-database/arango-database.service';
import { RuleService } from '../rule/rule.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateRuleConfigDto } from './dto/create-rule-config.dto';

describe('RuleConfigService', () => {
  let service: RuleConfigService;
  let dbMock: any;
  let ruleServiceMock: any;

  beforeEach(async () => {
    const mockCollection = {
      save: jest.fn().mockResolvedValue(undefined),
      documentExists: jest.fn().mockResolvedValue(true),
      update: jest.fn(),
      document: jest.fn(),
    };

    dbMock = {
      getDatabase: jest.fn(() => ({
        collection: jest.fn(() => mockCollection),
        query: jest.fn(),
      })),
    };

    ruleServiceMock = {
      findOne: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RuleConfigService,
        { provide: ArangoDatabaseService, useValue: dbMock },
        { provide: RuleService, useValue: ruleServiceMock },
      ],
    }).compile();

    service = module.get<RuleConfigService>(RuleConfigService);
  });

  it('should create and return rule configuration', async () => {
    const createRuleConfigDto: CreateRuleConfigDto = {
      ruleId: 'rule/rule-123',
      desc: 'Description for new rule config',
      cfg: '1.0.0',
      config: {
        parameters: [],
        exitConditions: [],
        bands: [],
        cases: [],
      },
    };
    const req = { user: { username: 'user1' } };

    const expectedSaveResult = {
      ...createRuleConfigDto,
      ownerId: 'user1',
      _key: expect.any(String),
      state: '01_DRAFT',
    };

    dbMock
      .getDatabase()
      .collection()
      .save.mockResolvedValue(expectedSaveResult);

    // Act
    const result = await service.create(createRuleConfigDto, req as any);

    // Assertions
    expect(dbMock.getDatabase().collection().save).toHaveBeenCalledWith(
      expectedSaveResult,
    );
    expect(result).toEqual(expectedSaveResult);
  });

  it('should throw BadRequestException if rule does not exist', async () => {
    const createRuleConfigDto: CreateRuleConfigDto = {
      ruleId: 'rule/rule-123',
      desc: 'Description for new rule config',
      cfg: '1.0.0',
      config: {
        parameters: [],
        exitConditions: [],
        bands: [],
        cases: [],
      },
    };
    const req = { user: { username: 'user1' } };

    ruleServiceMock.findOne.mockResolvedValue(undefined);

    await expect(
      service.create(createRuleConfigDto, req as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('should return a rule configuration when found', async () => {
    const ruleConfig = { _key: '123', desc: 'Existing Rule' };
    dbMock.getDatabase().collection().document.mockResolvedValue(ruleConfig);

    const result = await service.findOne('123');

    expect(result).toEqual(ruleConfig);
  });

  it('should throw NotFoundException when rule config is not found', async () => {
    dbMock
      .getDatabase()
      .collection()
      .document.mockRejectedValue(new Error('not found'));

    await expect(service.findOne('123')).rejects.toThrow(NotFoundException);
  });

  it('should update the rule configuration', async () => {
    dbMock.getDatabase().collection().documentExists.mockResolvedValue(true);
    dbMock
      .getDatabase()
      .collection()
      .update.mockResolvedValue({ new: { _key: '123', desc: 'Updated' } });

    const updateDto = { desc: 'Updated' };
    const result = await service.update('123', updateDto);

    expect(dbMock.getDatabase().collection().update).toHaveBeenCalledWith(
      '123',
      updateDto,
      { returnNew: true },
    );
    expect(result).toEqual({ _key: '123', desc: 'Updated' });
  });
});
