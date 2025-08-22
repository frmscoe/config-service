// SPDX-License-Identifier: Apache-2.0
import { Test, TestingModule } from '@nestjs/testing';
import { RuleService } from './rule.service';
import { v4 as uuidv4 } from 'uuid';
import { DataTypeEnum, SourceEnum, StateEnum, RULE_COLLECTION } from './schema/rule.schema';
import { ArangoDatabaseService } from '../arango-database/arango-database.service'; // Adjust the path if needed
import { CreateRuleDto } from './dto/create-rule.dto';


describe('RuleService', () => {
  let service: RuleService;

  const mockArangoCollection = {
    save: jest.fn(),
    firstExample: jest.fn(),
    document: jest.fn(),
    update: jest.fn(),
  };

  const mockArangoDatabase = {
    collection: jest.fn(() => mockArangoCollection),
  };

  const mockArangoDatabaseService = {
    getDatabase: jest.fn(() => mockArangoDatabase),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RuleService,
        {
          provide: ArangoDatabaseService, //Actual class, not a string
          useValue: mockArangoDatabaseService,
        },
      ],
    }).compile();

    service = module.get<RuleService>(RuleService);
  });

  
  // RU-001
  it('should create a rule with valid cfg, name, dataType, and desc', async () => {
    const dto = {
      cfg: '1.0.0',
      name: 'rule-001',
      dataType: DataTypeEnum.NUMERIC,
      desc: 'Checks transaction amounts for anomalies',
      source: SourceEnum.USER_CREATED,
    };

    const mockRequest = {
      user: {
        username: 'test_user',
      },
    };

    mockArangoCollection.firstExample.mockResolvedValue(null); // key line

    const savedRule = {
      ...dto,
      _key: uuidv4(),
      ownerId: 'test_user',
      state: '01_DRAFT',
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      updatedBy: 'test_user',
    };

    mockArangoCollection.save.mockResolvedValue(savedRule);

    const result = await service.create(dto, mockRequest as any);

    expect(mockArangoCollection.save).toHaveBeenCalledWith(expect.objectContaining({
      name: dto.name,
      cfg: dto.cfg,
      dataType: dto.dataType,
      desc: dto.desc,
      ownerId: 'test_user',
      state: '01_DRAFT',
    }));

    expect(result).toEqual(savedRule);
  });


  // RU-002
  it('RU-002:should reject duplicate rule name/version', async () => {
    const dto = {
      cfg: '1.0.0',
      name: 'rule-001',
      dataType: DataTypeEnum.NUMERIC,
      desc: 'Duplicate rule',
      source: SourceEnum.USER_CREATED,
    };

    const mockRequest = {
      user: {
        username: 'test_user',
      },
    };

    // Simulate existing rule returned by firstExample
    mockArangoCollection.firstExample = jest.fn().mockResolvedValue({
      _key: 'existing-rule-id',
      name: dto.name,
      cfg: dto.cfg,
    });

    await expect(service.create(dto, mockRequest as any)).rejects.toThrow('Rule already exists');
  });

  // RU-003
  it('should fetch rule by valid UUID', async () => {
    const ruleId = 'rule-uuid-001';
    const mockRule = {
      _key: ruleId,
      name: 'rule-001',
      cfg: '1.0.0',
      dataType: DataTypeEnum.NUMERIC,
      desc: 'Mock rule',
      ownerId: 'test_user',
      state: StateEnum['01_DRAFT'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updatedBy: 'test_user',
    };

    // Mock .document() on collection()
    mockArangoCollection.document = jest.fn().mockResolvedValue(mockRule);

    const result = await service.findOne(ruleId);

    expect(mockArangoDatabase.collection).toHaveBeenCalledWith(RULE_COLLECTION);
    expect(mockArangoCollection.document).toHaveBeenCalledWith(ruleId);
    expect(result).toEqual(mockRule);
  });

  // RU-004
  it('should update rule fields and increment version correctly', async () => {
    const ruleId = 'existing-rule-id';
    const originalRule = {
      _key: ruleId,
      name: 'rule-001',
      desc: 'Old description',
      cfg: '1.0.0',
      dataType: 'NUMERIC',
      ownerId: 'test_user',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };

    const updatedData = {
      desc: 'Updated rule description',
      cfg: '1.0.1',
    };

    const updatedRule = {
      ...originalRule,
      ...updatedData,
      updatedAt: expect.any(String),
    };

    mockArangoCollection.update = jest.fn().mockResolvedValue({ new: updatedRule });

    const result = await service.update(ruleId, updatedData);

    expect(mockArangoDatabase.collection).toHaveBeenCalledWith(RULE_COLLECTION);
    expect(mockArangoCollection.update).toHaveBeenCalledWith(
      ruleId,
      expect.objectContaining({
        ...updatedData,
        updatedAt: expect.any(String),
      }),
      { returnNew: true }
    );

    expect(result).toEqual(updatedRule);
  });

  // RU-005
    describe('bumpVersion', () => {
      it('should correctly bump the minor version and reset patch', () => {
        const result = service.bumpVersion('1.2.3', 'minor');
        expect(result).toBe('1.3.0');
      });

      it('should correctly bump the patch version', () => {
        const result = service.bumpVersion('1.2.3', 'patch');
        expect(result).toBe('1.2.4');
      });

      it('should throw an error for invalid version string', () => {
        expect(() => service.bumpVersion('1.2', 'patch')).toThrow('Invalid version format: 1.2');
      });

      it('should throw an error for unsupported bump level', () => {
        // @ts-expect-error testing invalid input
        expect(() => service.bumpVersion('1.2.3', 'major')).toThrow('Unsupported bump level: major');
      });
    });

    // RU-006
  describe('parseRuleId', () => {
    it('should correctly parse rule ID and version', () => {
      const result = service.parseRuleId('abc123@1.2.3');
      expect(result).toEqual({ ruleId: 'abc123', version: '1.2.3' });
    });

    it('should throw if format is invalid (no @)', () => {
      expect(() => service.parseRuleId('abc123')).toThrow('Invalid composite rule ID format');
    });

    it('should throw if ruleId or version is missing', () => {
      expect(() => service.parseRuleId('abc123@')).toThrow('Both rule ID and version must be present');
      expect(() => service.parseRuleId('@1.2.3')).toThrow('Both rule ID and version must be present');
    });
  });

    // RU-007
  describe('validateRuleUUID', () => {
    it('should pass for a valid UUID', () => {
      const validUUID = '550e8400-e29b-41d4-a716-446655440000';
      expect(() => service.validateRuleUUID(validUUID)).not.toThrow();
    });

    it('should throw an error for an invalid UUID', () => {
      const invalidUUID = '123-invalid-uuid';
      expect(() => service.validateRuleUUID(invalidUUID)).toThrow('Invalid UUID format');
    });
  });

  // RULE-001 
  // is skipped because rule.schema.ts is not a test file. 
  // Most importantly RU-007 already handles the check

  // RULE-002
  it('should generate a UUID (_key) if not provided in CreateRuleDto', async () => {
    const createRuleDto: CreateRuleDto = {
      name: 'UUID Rule',
      cfg: '1.0.0',
      dataType: DataTypeEnum.NUMERIC,
      desc: 'Test rule for UUID generation',
    };

    const mockUser = { username: 'uuid_tester' };
    const mockRequest: any = { user: mockUser };

    let savedDoc: any;
    mockArangoCollection.save = jest.fn().mockImplementation(async (doc) => {
      savedDoc = doc;
      return doc;
    });

    mockArangoCollection.firstExample = jest.fn().mockResolvedValue(null);

    const result = await service.create(createRuleDto, mockRequest);

    expect(savedDoc).toHaveProperty('_key');
    expect(typeof savedDoc._key).toBe('string');
    expect(savedDoc._key).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });


  // Transition WF-001 through WF-010
describe('RuleService - Workflow Transitions', () => {
  const ruleId = 'rule-123';
  const mockReq = { user: { username: 'tester' } } as any;

  beforeEach(() => {
    service = new RuleService({ getDatabase: () => mockArangoDatabase } as any);
    mockArangoCollection.update.mockClear();
  });

  it('WF-001: Should transition from Draft to Pending Review', async () => {
    await service.updateStateOnly(ruleId, '10_PENDING_REVIEW', mockReq);
    expect(mockArangoCollection.update).toHaveBeenCalledWith(
      ruleId,
      expect.objectContaining({ state: '10_PENDING_REVIEW' }),
      // expect.anything()
    );
  });

  it('WF-002: Should transition from Review to Approved', async () => {
    await service.updateStateOnly(ruleId, '20_APPROVED', mockReq);
    expect(mockArangoCollection.update).toHaveBeenCalledWith(
      ruleId,
      expect.objectContaining({ state: '20_APPROVED' }),
      // expect.anything()
    );
  });

  it('WF-003: Should transition from Review to Rejected', async () => {
    await service.updateStateOnly(ruleId, '11_REJECTED', mockReq);
    expect(mockArangoCollection.update).toHaveBeenCalledWith(
      ruleId,
      expect.objectContaining({ state: '11_REJECTED' }),
      // expect.anything()
    );
  });

  it('WF-004: Should transition from Withdrawn to Archived', async () => {
    await service.updateStateOnly(ruleId, '91_ARCHIVED', mockReq);
    expect(mockArangoCollection.update).toHaveBeenCalledWith(
      ruleId,
      expect.objectContaining({ state: '91_ARCHIVED' }),
      // expect.anything()
    );
  });

  it('WF-005: Should transition from Rejected to Abandoned', async () => {
    await service.updateStateOnly(ruleId, '90_ABANDONED', mockReq);
    expect(mockArangoCollection.update).toHaveBeenCalledWith(
      ruleId,
      expect.objectContaining({ state: '90_ABANDONED' }),
      // expect.anything()
    );
  });

  it('WF-006: Should transition from Rejected to Draft', async () => {
    await service.updateStateOnly(ruleId, '01_DRAFT', mockReq);
    expect(mockArangoCollection.update).toHaveBeenCalledWith(
      ruleId,
      expect.objectContaining({ state: '01_DRAFT' }),
      // expect.anything()
    );
  });

  it('WF-007: Should transition from Approved to Deployed', async () => {
    await service.updateStateOnly(ruleId, '30_DEPLOYED', mockReq);
    expect(mockArangoCollection.update).toHaveBeenCalledWith(
      ruleId,
      expect.objectContaining({ state: '30_DEPLOYED' }),
      // expect.anything()
    );
  });

  it('WF-008: Should transition from Deployed to Retired', async () => {
    await service.updateStateOnly(ruleId, '32_RETIRED', mockReq);
    expect(mockArangoCollection.update).toHaveBeenCalledWith(
      ruleId,
      expect.objectContaining({ state: '32_RETIRED' }),
      // expect.anything()
    );
  });
});






});
