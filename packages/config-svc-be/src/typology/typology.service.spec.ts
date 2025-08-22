import { TypologyService } from './typology.service';
import { ArangoDatabaseService } from '../arango-database/arango-database.service';
import { Request } from 'express';
import { TypologyStateEnum } from './enums/typology-state.enum';
import { TypologyRuleWithConfigs } from './entities/typology.entity';



describe('TypologyService', () => {
  let service: TypologyService;
  let dbMock: any;
  let collectionMock: any;

  beforeEach(() => {
    collectionMock = {
      save: jest.fn().mockResolvedValue({
        new: {
          name: 'Fraud Typology A',
          desc: 'Detects fraud using velocity checks',
          cfg: '1.0.0',
          _key: 'generated-key',
          state: TypologyStateEnum['01_DRAFT'],
          ownerId: 'john_doe',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      }),
    };

    dbMock = {
      collection: jest.fn().mockReturnValue(collectionMock),
    };

    const arangoDatabaseService = {
      getDatabase: () => dbMock,
    };

    service = new TypologyService(arangoDatabaseService as any);
  });

  // TY-001
  it('TY-001: createTypology() should create a new typology with metadata and rules', async () => {
    const dto = {
      name: 'Fraud Typology A',
      desc: 'Detects fraud using velocity checks',
      cfg: '1.0.0',
    };

    const mockRequest = {
      user: { username: 'john_doe' },
    } as unknown as Request;

    const result = await service.create(dto as any, mockRequest);

    expect(collectionMock.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: dto.name,
        desc: dto.desc,
        cfg: dto.cfg,
        state: TypologyStateEnum['01_DRAFT'],
        ownerId: 'john_doe',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      }),
      { returnNew: true },
    );

    expect(result).toHaveProperty('name', dto.name);
    expect(result).toHaveProperty('ownerId', 'john_doe');
    expect(result).toHaveProperty('state', TypologyStateEnum['01_DRAFT']);
  });

  // TY-002
  it('TY-002: addRuleToTypology() should add rule to typology structure', async () => {
    const typologyId = 'typology-001';
    const ruleId = 'rule-abc-123';

    const existingTypology = {
      _key: typologyId,
      name: 'Fraud Structure A',
      rules_rule_configs: [],
      updatedAt: '2025-01-01T00:00:00.000Z',
    };

    const updatedTypology = {
      ...existingTypology,
      rules_rule_configs: [
        {
          ruleId,
          ruleConfigId: [],
        },
      ],
      updatedAt: expect.any(String),
    };

    const collectionMock = {
      update: jest.fn().mockResolvedValue({ new: updatedTypology }),
      document: jest.fn().mockResolvedValue(existingTypology),
    };

    const dbMock = {
      collection: jest.fn().mockReturnValue(collectionMock),
      query: jest.fn().mockResolvedValue({
        all: jest.fn(),
        next: jest.fn().mockResolvedValue(existingTypology),
      }),
    };

    const arangoService = {
      getDatabase: () => dbMock,
    };

    const service = new TypologyService(arangoService as any);

    const result = await service.addRuleToTypology(typologyId, ruleId);

    expect(result.rules_rule_configs.map(r => r.ruleId)).toContain(ruleId);
    expect(collectionMock.update).toHaveBeenCalledWith(
      typologyId,
      expect.objectContaining({
        rules_rule_configs: [
          {
            ruleId,
            ruleConfigId: [],
          },
        ],
        updatedAt: expect.any(String),
      }),
      { returnNew: true },
    );
  });

  // TY-003
  it('TY-003: preventDuplicateRules() should throw if rule already exists in typology', async () => {
    const typologyId = 'typology-001';
    const ruleId = 'rule-abc-123';

    const existingTypology = {
      _key: typologyId,
      name: 'Fraud Structure A',
      rules_rule_configs: [{ ruleId, ruleConfigId: [] }],
      updatedAt: '2025-01-01T00:00:00.000Z',
    };

    const collectionMock = {
      update: jest.fn(),
      document: jest.fn().mockResolvedValue(existingTypology),
    };

    const dbMock = {
      collection: jest.fn().mockReturnValue(collectionMock),
      query: jest.fn().mockResolvedValue({
        next: jest.fn().mockResolvedValue(existingTypology),
      }),
    };

    const arangoService = {
      getDatabase: () => dbMock,
    };

    const service = new TypologyService(arangoService as any);

    await expect(service.addRuleToTypology(typologyId, ruleId)).rejects.toThrow(
      `Rule ${ruleId} is already added to the typology`,
    );

    expect(collectionMock.update).not.toHaveBeenCalled();
  });

  // TY-004 Frontend UI
  // it('TY-004: fetchRuleMetadata() should return rule metadata', async () => {
  //   const ruleId = 'rule/abc-123';

  //   const ruleMetadata = {
  //     _id: ruleId,
  //     _key: 'abc-123',
  //     name: 'High Risk Transaction',
  //     cfg: '1.0.0',
  //   };

  //   const dbMock = {
  //     query: jest.fn().mockResolvedValue({
  //       next: jest.fn().mockResolvedValue(ruleMetadata),
  //     }),
  //   };

  //   const arangoService = {
  //     getDatabase: () => dbMock,
  //   };

  //   const service = new TypologyService(arangoService as any);

  //   const result = await service.fetchRuleMetadata(ruleId);

  //   expect(result).toEqual(ruleMetadata);
  //   expect(dbMock.query).toHaveBeenCalledWith(expect.any(String), { ruleId });
  // });

  // TY-005 Frontend UI

  // TY-006 Frontend UI
  // it('TY-006: addAllRuleOutcomes() should save outcomes for a rule in typology', async () => {
  //   const typologyId = 'typ-001';
  //   const ruleId = 'rule-001';
  //   const outcomes = ['.x01', '.x02', '.err'];

  //   const existing = {
  //     _key: typologyId,
  //     rules_rule_configs: [
  //       { ruleId, ruleConfigId: [] },
  //     ],
  //   };

  //   const updated = {
  //     ...existing,
  //     rules_rule_configs: [
  //       { ruleId, ruleConfigId: [], outcomes },
  //     ],
  //     updatedAt: expect.any(String),
  //   };

  //   const collectionMock = {
  //     update: jest.fn().mockResolvedValue({ new: updated }),
  //     document: jest.fn().mockResolvedValue(existing),
  //   };

  //   const dbMock = {
  //     collection: jest.fn().mockReturnValue(collectionMock),
  //   };

  //   const arangoService = {
  //     getDatabase: () => dbMock,
  //   };

  //   const service = new TypologyService(arangoService as any);
  //   const result = await service.addAllRuleOutcomes(typologyId, ruleId, outcomes);

  //   expect(result.rules_rule_configs[0].outcomes).toEqual(outcomes);
  //   expect(collectionMock.update).toHaveBeenCalled();
  // });


  // Transition WF-001 through WF-010
  describe('TypologyService - Workflow Transitions', () => {
    let service: TypologyService;
    const mockCollection = { update: jest.fn() };
    const mockDB = { collection: () => mockCollection };
    const mockArangoService = { getDatabase: () => mockDB };

    const mockReq = { user: { username: 'tester' } } as any;
    const typologyId = 'typology-001';

    beforeEach(() => {
      service = new TypologyService(mockArangoService as any);
      jest.clearAllMocks();
    });

    const setupFindOne = (state: keyof typeof TypologyStateEnum) => {
      service.findOne = jest.fn().mockResolvedValue({
        _key: typologyId,
        state: TypologyStateEnum[state],
      });
    };

    it('should transition from 01_DRAFT to 10_PENDING_REVIEW', async () => {
      setupFindOne('01_DRAFT');
      mockCollection.update.mockResolvedValue({
        new: { _key: typologyId, state: TypologyStateEnum['10_PENDING_REVIEW'] },
      });

      const result = await service.transitionTypologyState(
        typologyId,
        TypologyStateEnum['10_PENDING_REVIEW'],
        mockReq,
      );

      expect(mockCollection.update).toHaveBeenCalledWith(
        typologyId,
        expect.objectContaining({
          state: TypologyStateEnum['10_PENDING_REVIEW'],
          updatedBy: 'tester',
        }),
        expect.anything(),
      );
      expect(result.state).toBe(TypologyStateEnum['10_PENDING_REVIEW']);
    });

    it('should transition from 10_PENDING_REVIEW to 20_APPROVED', async () => {
      setupFindOne('10_PENDING_REVIEW');
      mockCollection.update.mockResolvedValue({
        new: { state: TypologyStateEnum['20_APPROVED'] },
      });

      const result = await service.transitionTypologyState(
        typologyId,
        TypologyStateEnum['20_APPROVED'],
        mockReq,
      );

      expect(result.state).toBe(TypologyStateEnum['20_APPROVED']);
    });

    it('should transition from 20_APPROVED to 30_DEPLOYED', async () => {
      setupFindOne('20_APPROVED');
      mockCollection.update.mockResolvedValue({
        new: { state: TypologyStateEnum['30_DEPLOYED'] },
      });

      const result = await service.transitionTypologyState(
        typologyId,
        TypologyStateEnum['30_DEPLOYED'],
        mockReq,
      );

      expect(result.state).toBe(TypologyStateEnum['30_DEPLOYED']);
    });

    it('should transition from 30_DEPLOYED to 32_RETIRED', async () => {
      setupFindOne('30_DEPLOYED');
      mockCollection.update.mockResolvedValue({
        new: { state: TypologyStateEnum['32_RETIRED'] },
      });

      const result = await service.transitionTypologyState(
        typologyId,
        TypologyStateEnum['32_RETIRED'],
        mockReq,
      );

      expect(result.state).toBe(TypologyStateEnum['32_RETIRED']);
    });

    it('should transition from 32_RETIRED to 91_ARCHIVED', async () => {
      setupFindOne('32_RETIRED');
      mockCollection.update.mockResolvedValue({
        new: { state: TypologyStateEnum['91_ARCHIVED'] },
      });

      const result = await service.transitionTypologyState(
        typologyId,
        TypologyStateEnum['91_ARCHIVED'],
        mockReq,
      );

      expect(result.state).toBe(TypologyStateEnum['91_ARCHIVED']);
    });
  });


  // TRC-005
  it('TRC-005: fetchLinkedRules() should return full rule-config mapping from typology', async () => {
    const typologyId = 'typ-001';

    const typology = {
      _key: typologyId,
      rules_rule_configs: [
        {
          ruleId: 'rule-123',
          ruleConfigId: ['cfg-1', 'cfg-2'],
        },
        {
          ruleId: 'rule-456',
          ruleConfigId: ['cfg-3'],
        },
      ],
    };

    const ruleMap = {
      'rule-123': { _key: 'rule-123', name: 'High Risk' },
      'rule-456': { _key: 'rule-456', name: 'Velocity Check' },
    };

    const configMap = {
      'cfg-1': { _key: 'cfg-1', name: 'Threshold = 5' },
      'cfg-2': { _key: 'cfg-2', name: 'Threshold = 10' },
      'cfg-3': { _key: 'cfg-3', name: 'Amount > 1000' },
    };

    const dbMock = {
      query: jest.fn()
        // 1st rule
        .mockResolvedValueOnce({
          next: jest.fn().mockResolvedValue(ruleMap['rule-123']),
        })
        .mockResolvedValueOnce({
          all: jest.fn().mockResolvedValue([configMap['cfg-1'], configMap['cfg-2']]),
        })
        // 2nd rule
        .mockResolvedValueOnce({
          next: jest.fn().mockResolvedValue(ruleMap['rule-456']),
        })
        .mockResolvedValueOnce({
          all: jest.fn().mockResolvedValue([configMap['cfg-3']]),
        }),
    };

    const arangoService = {
      getDatabase: () => dbMock,
    };

    const service = new TypologyService(arangoService as any);
    service.findOne = jest.fn().mockResolvedValue(typology);

    const result = await service.fetchLinkedRules(typologyId);

    expect(result).toEqual([
      {
        rule: ruleMap['rule-123'],
        configs: [configMap['cfg-1'], configMap['cfg-2']],
      },
      {
        rule: ruleMap['rule-456'],
        configs: [configMap['cfg-3']],
      },
    ]);

    expect(service.findOne).toHaveBeenCalledWith(typologyId);
  });



});
