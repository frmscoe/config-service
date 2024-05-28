import { Test, TestingModule } from '@nestjs/testing';
import { RuleConfigController } from './rule-config.controller';
import { RuleConfigService } from './rule-config.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PrivilegeService } from '../privilege/privilege.service';
import { CreateRuleConfigDto } from './dto/create-rule-config.dto';

describe('RuleConfigController', () => {
  let controller: RuleConfigController;
  let service: RuleConfigService;

  const mockRuleConfigService = {
    create: jest.fn((dto, req) => ({
      ...dto,
      ownerId: req.user.username,
      _key: 'generated-id',
      state: '01_DRAFT',
    })),
    findAll: jest.fn(() => ({
      count: 1,
      data: [
        {
          _key: 'sample-key',
          desc: 'Sample Description',
          cfg: '1.0.0',
          ownerId: 'user@example.com',
          state: '01_DRAFT',
          createdAt: '2021-08-31T00:00:00.000Z',
          updatedAt: '2021-08-31T00:00:00.000Z',
          ruleId: 'rule/sample-uuid-3',
          updatedBy: null,
          approverId: null,
          config: {
            parameters: [],
            exitConditions: [],
            bands: [],
            cases: [],
          },
        },
      ],
    })),
    findOne: jest.fn((id) => ({
      _key: id,
      desc: 'Sample Description',
      cfg: '1.0.0',
      ownerId: 'user@example.com',
      state: '01_DRAFT',
      createdAt: '2021-08-31T00:00:00.000Z',
      updatedAt: '2021-08-31T00:00:00.000Z',
      ruleId: 'rule/sample-uuid-3',
      updatedBy: null,
      approverId: null,
      config: {
        parameters: [],
        exitConditions: [],
        bands: [],
        cases: [],
      },
    })),
    duplicateRuleConfig: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RuleConfigController],
      providers: [
        { provide: RuleConfigService, useValue: mockRuleConfigService },
        {
          provide: JwtAuthGuard,
          useValue: { canActivate: jest.fn(() => true) },
        },
        { provide: RolesGuard, useValue: { canActivate: jest.fn(() => true) } },
        { provide: PrivilegeService, useValue: {} },
      ],
    }).compile();

    controller = module.get<RuleConfigController>(RuleConfigController);
    service = module.get<RuleConfigService>(RuleConfigService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a new rule configuration and return it', async () => {
    const createRuleConfigDto: CreateRuleConfigDto = {
      cfg: '1.0.0',
      desc: 'Outgoing transfer similarity - amounts',
      ruleId: 'rule/sample-uuid-3',
      config: {
        parameters: [],
        exitConditions: [],
        bands: [],
        cases: [],
      },
    };
    const req = {
      user: {
        clientId: 'test-client-id',
        username: 'test-user@example.com',
        participantRoleIds: undefined,
        platformRoleIds: [1],
      },
    };

    const result = await controller.create(createRuleConfigDto, req as any);
    expect(result).toEqual({
      ...createRuleConfigDto,
      ownerId: 'test-user@example.com',
      _key: 'generated-id',
      state: '01_DRAFT',
    });
  });

  it('should retrieve all rule configurations', async () => {
    const page = 1;
    const limit = 10;
    const mockResult = {
      count: 1,
      data: [
        {
          _key: 'sample-key',
          desc: 'Sample Description',
          cfg: '1.0.0',
          ownerId: 'user@example.com',
          state: '01_DRAFT',
          createdAt: '2021-08-31T00:00:00.000Z',
          updatedAt: '2021-08-31T00:00:00.000Z',
          ruleId: 'rule/sample-uuid-3',
          updatedBy: null,
          approverId: null,
          config: {
            parameters: [],
            exitConditions: [],
            bands: [],
            cases: [],
          },
        },
      ],
    };

    // Act
    const result = await controller.findAll(page, limit);

    // Assertions
    expect(mockRuleConfigService.findAll).toHaveBeenCalledWith({ page, limit });
    expect(result).toEqual(mockResult);
  });

  it('should retrieve a single rule configuration by ID', async () => {
    const ruleConfigId = 'sample-key';
    const expectedRuleConfig = {
      _key: ruleConfigId,
      desc: 'Sample Description',
      cfg: '1.0.0',
      ownerId: 'user@example.com',
      state: '01_DRAFT',
      createdAt: '2021-08-31T00:00:00.000Z',
      updatedAt: '2021-08-31T00:00:00.000Z',
      ruleId: 'rule/sample-uuid-3',
      updatedBy: null,
      approverId: null,
      config: {
        parameters: [],
        exitConditions: [],
        bands: [],
        cases: [],
      },
    };

    // Act
    const result = await controller.findOne(ruleConfigId);

    // Assertions
    expect(mockRuleConfigService.findOne).toHaveBeenCalledWith(ruleConfigId);
    expect(result).toEqual(expectedRuleConfig);
  });

  it('should update a rule configuration and return the updated configuration', async () => {
    const id = 'rule-config-id';
    const updateRuleConfigDto = {
      cfg: '1.1.0',
      desc: 'Updated description',
      config: {
        parameters: [],
        exitConditions: [],
        bands: [],
        cases: [],
      },
    };
    const req = { user: { username: 'test-user' } };

    const expectedUpdatedRuleConfig = {
      _key: id,
      desc: updateRuleConfigDto.desc,
      cfg: updateRuleConfigDto.cfg,
      ownerId: 'user@example.com',
      state: '01_DRAFT',
      createdAt: '2021-08-31T00:00:00.000Z',
      updatedAt: '2021-08-31T00:00:00.000Z',
      ruleId: 'rule/sample-uuid-3',
      updatedBy: 'test-user',
      config: updateRuleConfigDto.config,
    };

    mockRuleConfigService.duplicateRuleConfig.mockResolvedValue(
      expectedUpdatedRuleConfig,
    );

    const result = await controller.update(id, updateRuleConfigDto, req as any);

    expect(mockRuleConfigService.duplicateRuleConfig).toHaveBeenCalledWith(
      id,
      updateRuleConfigDto,
      req,
    );
    expect(result).toEqual(expectedUpdatedRuleConfig);
  });
});
