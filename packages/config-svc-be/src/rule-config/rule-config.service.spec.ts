// SPDX-License-Identifier: Apache-2.0
import { Test, TestingModule } from '@nestjs/testing';
import { RuleConfigService } from './rule-config.service';
import { ArangoDatabaseService } from '../arango-database/arango-database.service';
import { RuleService } from '../rule/rule.service';
import { StateEnum } from '../rule/schema/rule.schema';
import { RULE_CONFIG_COLLECTION } from './schema/rule-config.schema';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';
import { CreateRuleConfigDto } from './dto/create-rule-config.dto';
import { Rule } from '../rule/entities/rule.entity';
import { RuleConfig } from './entities/rule-config.entity';
import { UpdateRuleConfigDto } from './dto/update-rule-config.dto';
import { Database } from 'arangojs'; 





describe('RuleConfigService', () => {
  let service: RuleConfigService;
  let mockArangoDbService: Partial<ArangoDatabaseService>;
  let mockRuleService: Partial<RuleService>;
  let ruleService: RuleService;
  let mockRequest: Partial<Request>;

  


  const mockArangoCollection = {
    save: jest.fn(),
  };

  const mockArangoDatabase = {
    collection: jest.fn(() => mockArangoCollection),
  };

  const mockArangoDatabaseService = {
    getDatabase: jest.fn(() => mockArangoDatabase),
  };

  const mockRule = {
    _key: 'rule-123',
    name: 'Test Rule',
    cfg: '1.0.0',
  };

  // const mockQuery = jest.fn();
  const mockQuery = jest.fn().mockResolvedValue({
    next: jest.fn().mockResolvedValue(null), // means: no duplicate found
  });

  (mockArangoDatabaseService.getDatabase as jest.Mock).mockReturnValue({
    ...mockArangoDatabase,
    query: mockQuery,
  });



  beforeEach(async () => {
    jest.clearAllMocks();

    // Always reset to fresh mocks
    mockArangoCollection.save = jest.fn();
    mockArangoDatabase.collection = jest.fn(() => mockArangoCollection);

    mockRuleService = {
      findOne: jest.fn().mockResolvedValue(mockRule),
    };

    // mockArangoDbService = {
    //   getDatabase: jest.fn(() => mockArangoDatabase as unknown as Database),
    // };
    mockArangoDbService = {
      getDatabase: jest.fn().mockReturnValue({
        ...mockArangoDatabase,
        query: mockQuery, // include query here!
      }),
    };

    // ruleService = {
    //   findOne: jest.fn(),
    // } as any;

    mockRequest = {
      user: {
        clientId: 'client-001',
        username: 'test-user',
        platformRoleIds: [],
        privileges: [],
      },
    };


    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RuleConfigService,
        { provide: ArangoDatabaseService, useValue: mockArangoDbService },
        { provide: RuleService, useValue: mockRuleService },
      ],
    }).compile();

    // service = module.get<RuleConfigService>(RuleConfigService);
    ruleService = {
      findOne: jest.fn().mockResolvedValue(mockRule),
    } as any;

    service = new RuleConfigService(mockArangoDbService as ArangoDatabaseService, ruleService);

  });





  // RC-001
  it('should create a rule config with valid bands', async () => {
    const dto = {
      cfg: '1.0.0',
      desc: 'Test Config Description',
      ruleId: 'rule-123',
      config: {
        bands: [
          {
            reason: 'Flag large amounts',
            value: 'HIGH',
            upperLimit: 100000,
            subRuleRef: 'rule/abc-123',
          },
        ],
      },

    };

    const mockRequest = {
      user: { username: 'test_user' },
    };

    const generatedKey = uuidv4();
    const expectedPayload = expect.objectContaining({
      cfg: dto.cfg,
      desc: dto.desc,
      ruleId: dto.ruleId,
      config: dto.config,
      ownerId: 'test_user',
      state: StateEnum['01_DRAFT'],
      updatedBy: 'test_user',
    });

    mockArangoCollection.save.mockResolvedValue({ new: expectedPayload });

    const result = await service.create(dto, mockRequest as any);

    expect(mockArangoCollection.save).toHaveBeenCalledWith(expectedPayload);
    expect(result).toMatchObject(expectedPayload);
  });

  // RC-002
  it('RC-002: createRuleConfig() should create a rule config with valid cases', async () => {
    const mockRequest = {
      user: {
        username: 'test_user',
      },
      get: jest.fn(),
      header: jest.fn(),
      accepts: jest.fn(),
      acceptsCharsets: jest.fn(),
      acceptsEncodings: jest.fn(),
      acceptsLanguages: jest.fn(),
      is: jest.fn(),
      // Add more if needed later
    } as unknown as Request;

    const mockRule = {
      _key: 'rule-456',
      _id: 'rule/rule-456',
      name: 'Sample Rule',
      cfg: '1.0.0',
      desc: 'Sample rule description',
      dataType: 'NUMERIC',
      ownerId: 'test_user',
      state: '01_DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updatedBy: 'test_user',
    };

    // Mock findOne to simulate that the rule exists
    // jest.spyOn(ruleService, 'findOne').mockResolvedValue(mockRule as any);
    jest.spyOn(service['ruleService'], 'findOne').mockResolvedValue(mockRule as any);

    const dto = {
      cfg: '1.0.0',
      desc: 'Config with valid cases',
      ruleId: 'rule-456',
      config: {
        cases: [
          {
            reason: 'Case A',
            value: 'A',
            subRuleRef: 'sub-rule-001',
          },
          {
            reason: 'Case B',
            value: 'B',
            subRuleRef: 'sub-rule-002',
          },
        ],
      },

    };

    const saveSpy = jest.fn().mockResolvedValue({ new: { ...dto, _key: 'generated-id' } });
    mockArangoCollection.save = saveSpy;

    const result = await service.create(dto, mockRequest);

    expect(saveSpy).toHaveBeenCalled();
    expect(result._key).toBe('generated-id');
    expect(result.config.cases).toHaveLength(2);
    expect(result.config.cases[0].value).toBe('A');
  });

  // RC-003
  it('RC-003: should reject config missing bands/cases', async () => {
    const mockRequest = {
      user: {
        username: 'test_user',
      },
    };

    const dto: CreateRuleConfigDto = {
      cfg: '1.0.0',
      desc: 'Missing bands and cases',
      ruleId: 'rule-abc@1.0.0',
      config: {}, // no bands or cases
    };

    // jest.spyOn(ruleService, 'findOne').mockResolvedValue(mockRule as any);
    jest.spyOn(mockRuleService, 'findOne').mockResolvedValue(mockRule as Rule);


    await expect(service.create(dto, mockRequest as any)).rejects.toThrow(
      'Config must contain at least one band, case, or exit condition',
    );
  });

  // RC-004
  it('RC-004 - Should generate new config version on update', async () => {
    const originalRuleConfig: RuleConfig = {
      _key: 'existing-key',
      _id: 'rule_config/existing-key',
      cfg: '1.0.0',
      desc: 'Old config',
      ruleId: 'rule-abc',
      config: { cases: [] },
      ownerId: 'user',
      state: StateEnum['01_DRAFT'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updatedBy: 'user',
      originatedID: 'origin-key',
    };

    // Mock existing rule config returned from findOne()
    jest.spyOn(service, 'findOne').mockResolvedValue(originalRuleConfig);

    
    const dto: UpdateRuleConfigDto = {
      cfg: '1.1.0',
      desc: 'Updated config description',
      config: {
        bands: [{
          reason: 'Updated reason',
          upperLimit: 5000,
          subRuleRef: 'sub-rule-999',
        }],
      },

    };


    const mockRequest: any = { user: { username: 'test_user' } };

    const saveSpy = jest.fn().mockResolvedValue({ new: { ...dto, _key: 'new-version' } });
    mockArangoDatabase.collection = jest.fn(() => ({
      save: saveSpy,
    }));

    (mockArangoDbService.getDatabase as jest.Mock).mockReturnValue({
      collection: mockArangoDatabase.collection,
    });

    const result = await service.duplicateRuleConfig(originalRuleConfig._key, dto, mockRequest);
    


    expect(result).toBeDefined();
    expect(result.cfg).toBe('1.1.0');
    expect(service.findOne).toHaveBeenCalledWith(originalRuleConfig._key);
    expect(saveSpy).toHaveBeenCalled();
    expect(result._key).toBe('new-version');

  });


  // RC-005
  it('RC-005: addExitConditions() should add exit conditions and rationale', async () => {
    const mockRequest = { user: { username: 'exit_user' } };

    const dto = {
      cfg: '1.0.0',
      desc: 'Exit Conditions Test',
      ruleId: 'rule-123',
      config: {
        exitConditions: [
          {
            rationale: 'If amount is zero or transaction fails',
            reason: 'Transaction completed',
            subRuleRef: 'sub-exit-001',
            type: 'exit',
          },
        ],
        bands: [
          {
            reason: 'Dummy Band',
            value: 'LOW',
            upperLimit: 10,
            subRuleRef: 'dummy-ref',
          },
        ],
      },
    };

    const returnValue = {
      _key: 'test-exit-key',
      _id: 'rule_config/test-exit-key',
      cfg: dto.cfg,
      desc: dto.desc,
      ruleId: dto.ruleId,
      ownerId: mockRequest.user.username,
      state: '01_DRAFT',
      updatedBy: mockRequest.user.username,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      originatedID: 'test-exit-key',
      config: dto.config,
    };

    mockArangoCollection.save.mockResolvedValueOnce({ new: returnValue });

    const result = await service.create(dto, mockRequest as any);

    expect(mockArangoCollection.save).toHaveBeenCalledWith(expect.objectContaining({
      cfg: dto.cfg,
      desc: dto.desc,
      ruleId: dto.ruleId,
      config: dto.config,
      ownerId: mockRequest.user.username,
      state: '01_DRAFT',
      updatedBy: mockRequest.user.username,
    }));

    expect(result).toHaveProperty('config.exitConditions');
    expect(Array.isArray(result.config.exitConditions)).toBe(true);
    expect(result.config.exitConditions).toHaveLength(1);
    expect(result.config.exitConditions[0].rationale).toContain('transaction fails');
  });

  // RC-006
  it('RC-006: parseRuleConfigId() should extract id and version from JSON input', () => {
    const rawInput = JSON.stringify({
      id: 'rule_config/abc-123',
      version: '1.0.0',
    });

    const result = service.parseRuleConfigId(rawInput);

    expect(result).toEqual({
      id: 'rule_config/abc-123',
      version: '1.0.0',
    });
  });

  it('RC-006b: parseRuleConfigId() should throw BadRequestException for invalid JSON', () => {
    const malformed = '{ id: "bad }';

    expect(() => service.parseRuleConfigId(malformed)).toThrow('Invalid rule config reference format');
  });

  it('RC-006c: parseRuleConfigId() should throw BadRequestException for missing fields', () => {
    const missingFields = JSON.stringify({ version: '1.0.0' });

    expect(() => service.parseRuleConfigId(missingFields)).toThrow('Invalid rule config reference format');
  });

  // RC-007
  it('RC-007: validateMetadataFields() should accept valid metadata and store it', () => {
    const metadata = {
      region: 'EU',
      reviewer: 'John Doe',
      tags: ['aml', 'kyc'],
    };

    const result = service.validateMetadataFields(metadata);

    expect(result).toEqual(metadata);
  });

  it('RC-007b: validateMetadataFields() should throw if metadata is not an object', () => {
    expect(() => service.validateMetadataFields(null as any)).toThrow('Metadata must be a valid object');
    expect(() => service.validateMetadataFields('not-an-object' as any)).toThrow('Metadata must be a valid object');
  });

  it('RC-007c: validateMetadataFields() should throw if metadata contains reserved keys', () => {
    const badMetadata = {
      _id: 'hack',
      reviewer: 'Jane Doe',
    };

    expect(() => service.validateMetadataFields(badMetadata)).toThrow('Metadata key "_id" is reserved');
  });


  // RCFG-001
  it('RCFG-001: validateRuleConfigJson() should parse and validate correct config JSON', () => {
    const validJson = JSON.stringify({
      bands: [
        { reason: 'Test Band', value: 'LOW', upperLimit: 5, subRuleRef: 'ref-low' },
      ],
    });

    const result = service.validateRuleConfigJson(validJson);
    expect(result.bands).toBeDefined();
    expect(result.bands[0].value).toBe('LOW');
  });

  it('RCFG-001b: validateRuleConfigJson() should throw for invalid JSON', () => {
    const badJson = '{invalid-json}';
    expect(() => service.validateRuleConfigJson(badJson)).toThrow('Invalid JSON format');
  });

  it('RCFG-001c: validateRuleConfigJson() should throw if config has no bands or cases', () => {
    const invalidStructure = JSON.stringify({}); // no bands or cases
    expect(() => service.validateRuleConfigJson(invalidStructure)).toThrow('Config must have at least one band or one case');
  });

  // RCFD-002
  it('RCFG-002: checkDuplicateConfig() should throw if ruleId + cfg already exist', async () => {
    const existingRuleId = 'rule-123';
    const version = '1.0.0';

    mockQuery.mockResolvedValueOnce({
      next: async () => ({ _id: 'rule_config/abc123' }), // Simulate existing config
    });

    await expect(service.checkDuplicateConfig(existingRuleId, version))
      .rejects
      .toThrow('Configuration already exists');
  });

  it('RCFG-002b: checkDuplicateConfig() should pass if no duplicate found', async () => {
    mockQuery.mockResolvedValueOnce({
      next: async () => null, // No duplicate
    });

    await expect(service.checkDuplicateConfig('rule-999', '2.0.0'))
      .resolves
      .toBeUndefined();
  });

  // RCFG-003
  it('RCFG-003: processBands() should correctly persist bands metadata', async () => {
    const mockRequest = {
      user: { username: 'test_user' },
    };

    const dto = {
      cfg: '1.0.0',
      desc: 'Test Band Metadata',
      ruleId: 'rule-123',
      config: {
        bands: [
          {
            reason: 'Flag high risk',
            value: 'RISKY',
            upperLimit: 99999,
            subRuleRef: 'sub-b001',
            metadata: {
              source: 'api-import',
              level: 'critical',
            },
          },
        ],
      },
    };

    const returnValue = {
      _key: 'band-meta-001',
      _id: 'rule_config/band-meta-001',
      cfg: dto.cfg,
      desc: dto.desc,
      ruleId: dto.ruleId,
      config: dto.config,
      ownerId: mockRequest.user.username,
      state: '01_DRAFT',
      updatedBy: mockRequest.user.username,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      originatedID: 'band-meta-001',
    };

    mockArangoCollection.save.mockResolvedValueOnce({ new: returnValue });

    const result = await service.create(dto, mockRequest as any);

    expect(mockArangoCollection.save).toHaveBeenCalledWith(expect.objectContaining({
      config: expect.objectContaining({
        bands: expect.arrayContaining([
          expect.objectContaining({
            metadata: expect.objectContaining({
              source: 'api-import',
              level: 'critical',
            }),
          }),
        ]),
      }),
    }));

    expect(result.config.bands[0].metadata.source).toBe('api-import');
    expect(result.config.bands[0].metadata.level).toBe('critical');
  });

  // RCFG-004
  it('RCFG-004: processCases() should correctly persist cases metadata', async () => {
    const mockRequest = {
      user: { username: 'test_user' },
    };

    const dto = {
      cfg: '1.0.0',
      desc: 'Test Case Metadata',
      ruleId: 'rule-456',
      config: {
        cases: [
          {
            reason: 'Suspicious login pattern',
            subRuleRef: 'rule/exit-check-001',
            value: 5,
            metadata: {
              source: 'analyst-review',
              threatLevel: 'medium',
            },
          },
        ],
      },
    };


    const returnValue = {
      _key: 'case-meta-001',
      _id: 'rule_config/case-meta-001',
      cfg: dto.cfg,
      desc: dto.desc,
      ruleId: dto.ruleId,
      config: dto.config,
      ownerId: mockRequest.user.username,
      state: '01_DRAFT',
      updatedBy: mockRequest.user.username,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      originatedID: 'case-meta-001',
    };

    mockArangoCollection.save.mockResolvedValueOnce({ new: returnValue });

    const result = await service.create(dto, mockRequest as any);

    expect(mockArangoCollection.save).toHaveBeenCalledWith(expect.objectContaining({
      config: expect.objectContaining({
        cases: expect.arrayContaining([
          expect.objectContaining({
            metadata: expect.objectContaining({
              source: 'analyst-review',
              threatLevel: 'medium',
            }),
          }),
        ]),
      }),
    }));

    expect(result.config.cases[0].metadata.source).toBe('analyst-review');
    expect(result.config.cases[0].metadata.threatLevel).toBe('medium');
  });


  // RCFG-005
  it('RCFG-005: checkEmptyConfig() should reject config without bands or cases', async () => {
    const dto = {
      cfg: '1.0.0',
      desc: 'Invalid empty config',
      ruleId: 'rule-123',
      config: {}, // No bands or cases
    };

    jest.spyOn(ruleService, 'findOne').mockResolvedValueOnce({ _id: 'rule-123' } as any);

    await expect(service.create(dto as any, mockRequest as any)).rejects.toThrow(
      'Config must contain at least one band, case, or exit condition',
    );
  });


  // RCFG-006
  it('RCFG-006: addExitsToConfig() should create config with exits and reasons', async () => {
    const dto = {
      cfg: '1.0.0',
      desc: 'Exit Logic Test',
      ruleId: 'rule-321',
      config: {
        exitConditions: [
          {
            rationale: 'Stop when fraud is detected',
            reason: 'Fraud Trigger',
            subRuleRef: 'exit-rule-001',
            type: 'exit',
          },
        ],
      },
    };

    const mockRequest = {
      user: {
        clientId: 'client-xyz',
        username: 'exit_user',
        platformRoleIds: [],
        privileges: [],
      },
    };

    const expectedSaved = {
      _key: 'exit-key-123',
      _id: 'rule_config/exit-key-123',
      ...dto,
      ownerId: mockRequest.user.username,
      state: StateEnum['01_DRAFT'],
      updatedBy: mockRequest.user.username,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      originatedID: 'exit-key-123',
    };

    mockArangoCollection.save.mockResolvedValueOnce({ new: expectedSaved });

    const result = await service.create(dto as any, mockRequest as any);

    expect(mockArangoCollection.save).toHaveBeenCalledWith(expect.objectContaining({
      config: expect.objectContaining({
        exitConditions: expect.arrayContaining([
          expect.objectContaining({
            rationale: 'Stop when fraud is detected',
            reason: 'Fraud Trigger',
            subRuleRef: 'exit-rule-001',
          }),
        ]),
      }),
    }));

    expect(result.config.exitConditions).toHaveLength(1);
    expect(result.config.exitConditions[0].rationale).toBe('Stop when fraud is detected');
  });



  // Transition WF-001 through WF-010
  describe('RuleConfigService - Workflow Transitions', () => {
    let service: RuleConfigService;
    const mockCollection = { update: jest.fn() };
    const mockDB = { collection: () => mockCollection };
    const mockArangoService = { getDatabase: () => mockDB };

    const mockReq = { user: { username: 'tester' } } as any;
    const ruleConfigId = 'rc-123';

    beforeEach(() => {
      service = new RuleConfigService(mockArangoService as any, {} as any);
      jest.clearAllMocks();
    });

    const setupFindOne = (state: keyof typeof StateEnum) => {
      service.findOne = jest.fn().mockResolvedValue({
        _key: ruleConfigId,
        state: StateEnum[state],
        config: {},
      });
    };

    it('WF-001: should transition from 01_DRAFT to 10_PENDING_REVIEW', async () => {
      setupFindOne('01_DRAFT');
      mockCollection.update.mockResolvedValue({ new: { _key: ruleConfigId, state: StateEnum['10_PENDING_REVIEW'] } });

      const result = await service.transitionRuleConfigState(ruleConfigId, StateEnum['10_PENDING_REVIEW'], mockReq);

      expect(mockCollection.update).toHaveBeenCalledWith(
        ruleConfigId,
        expect.objectContaining({ state: StateEnum['10_PENDING_REVIEW'], updatedBy: 'tester' })
      );
      expect(result.state).toEqual(StateEnum['10_PENDING_REVIEW']);
    });

    it('WF-002: should transition from 10_PENDING_REVIEW to 20_APPROVED', async () => {
      setupFindOne('10_PENDING_REVIEW');
      mockCollection.update.mockResolvedValue({ new: { state: StateEnum['20_APPROVED'] } });
      const result = await service.transitionRuleConfigState(ruleConfigId, StateEnum['20_APPROVED'], mockReq);
      expect(result.state).toBe(StateEnum['20_APPROVED']);
    });

    it('WF-003: should transition from 10_PENDING_REVIEW to 01_DRAFT', async () => {
      setupFindOne('10_PENDING_REVIEW');
      mockCollection.update.mockResolvedValue({ new: { state: StateEnum['01_DRAFT'] } });
      const result = await service.transitionRuleConfigState(ruleConfigId, StateEnum['01_DRAFT'], mockReq);
      expect(result.state).toBe(StateEnum['01_DRAFT']);
    });

    it('WF-004: should transition from 20_APPROVED to 30_DEPLOYED', async () => {
      setupFindOne('20_APPROVED');
      mockCollection.update.mockResolvedValue({ new: { state: StateEnum['30_DEPLOYED'] } });
      const result = await service.transitionRuleConfigState(ruleConfigId, StateEnum['30_DEPLOYED'], mockReq);
      expect(result.state).toBe(StateEnum['30_DEPLOYED']);
    });

    it('WF-005: should transition from 20_APPROVED to 90_APPROVED', async () => {
      setupFindOne('20_APPROVED');
      mockCollection.update.mockResolvedValue({ new: { state: StateEnum['90_APPROVED'] } });
      const result = await service.transitionRuleConfigState(ruleConfigId, StateEnum['90_APPROVED'], mockReq);
      expect(result.state).toBe(StateEnum['90_APPROVED']);
    });

    it('WF-006: should transition from 20_APPROVED to 91_RETIRED', async () => {
      setupFindOne('20_APPROVED');
      mockCollection.update.mockResolvedValue({ new: { state: StateEnum['91_RETIRED'] } });
      const result = await service.transitionRuleConfigState(ruleConfigId, StateEnum['91_RETIRED'], mockReq);
      expect(result.state).toBe(StateEnum['91_RETIRED']);
    });

    it('WF-007: should transition from 20_APPROVED to 92_DISABLED', async () => {
      setupFindOne('20_APPROVED');
      mockCollection.update.mockResolvedValue({ new: { state: StateEnum['92_DISABLED'] } });
      const result = await service.transitionRuleConfigState(ruleConfigId, StateEnum['92_DISABLED'], mockReq);
      expect(result.state).toBe(StateEnum['92_DISABLED']);
    });

    it('WF-008: should transition from 30_DEPLOYED to 32_RETIRED', async () => {
      setupFindOne('30_DEPLOYED');
      mockCollection.update.mockResolvedValue({ new: { state: StateEnum['32_RETIRED'] } });
      const result = await service.transitionRuleConfigState(ruleConfigId, StateEnum['32_RETIRED'], mockReq);
      expect(result.state).toBe(StateEnum['32_RETIRED']);
    });

    it('WF-009: should transition from 32_RETIRED to 91_ARCHIVED', async () => {
      setupFindOne('32_RETIRED');
      mockCollection.update.mockResolvedValue({ new: { state: StateEnum['91_ARCHIVED'] } });
      const result = await service.transitionRuleConfigState(ruleConfigId, StateEnum['91_ARCHIVED'], mockReq);
      expect(result.state).toBe(StateEnum['91_ARCHIVED']);
    });
  });




});


