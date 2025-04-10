// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { Test, TestingModule } from '@nestjs/testing';
import { RuleController } from './rule.controller';
import { RuleService } from './rule.service';
import { CanActivate } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrivilegeService } from '../privilege/privilege.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RuleWithConfig } from './entities/rule.entity';

describe('RuleController', () => {
  let controller: RuleController;
  let service: RuleService;
    beforeEach(async () => {
    const mockAuthGuard: CanActivate = { canActivate: jest.fn(() => true) };
    const mockRolesGuard: CanActivate = { canActivate: jest.fn(() => true) };
    const mockRuleService = {
      findAll: jest.fn().mockImplementation((dto) => {
        return [{ ...dto }];
      }),
      create: jest.fn().mockImplementation((dto) => {
        return {
          ...dto,
          _key: '364ebb45-aca4-419b-a911-a7aa11f7710b',
          _id: 'rule/364ebb45-aca4-419b-a911-a7aa11f7710b',
          _rev: '_hl9VTsG---',
        };
      }),
      update: jest.fn().mockImplementation((id, dto) => {
        return {
          ...dto,
          _key: '364ebb45-aca4-419b-a911-a7aa11f7710b',
          _id: 'rule/364ebb45-aca4-419b-a911-a7aa11f7710b',
          _rev: '_hl9VTsG---',
          originatedID: id,
        };
      }),
      findRuleConfigsByName: jest.fn().mockResolvedValue({
        rule: {
          _key: 'test-rule-id',
          name: 'test-rule-name',
          desc: 'Test Rule Description',
          cfg: '1.0.0',
          dataType: 'currency',
          ownerId: ''
        },
        ruleConfigs: [{
          _key: 'test-rule-config-id',
          cfg: '1.0.0',
          desc: 'Test Rule Config Description',
          ownerId: '',
          state: '01_DRAFT',
          config: {
            parameters: [],
            exitConditions: [],
            bands: [],
            cases: [],
          },
        }],
      })
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RuleController],
      providers: [RuleService, PrivilegeService],
    })
      .overrideProvider(RuleService)
      .useValue(mockRuleService)
      .overrideGuard(JwtAuthGuard)
      .useValue(mockAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
            .compile();

    controller = module.get<RuleController>(RuleController);
    service = module.get<RuleService>(RuleService);
  });
      it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should retrieve a rule and its configurations by rule name', async () => {
    const ruleName = 'test-rule-name';
    const result = await controller.findRuleConfigsByName(ruleName);

    expect(service.findRuleConfigsByName).toHaveBeenCalledWith(ruleName);
    expect(result.rule.name).toEqual(ruleName);
    expect(result.ruleConfigs[0]).toHaveProperty('_key', 'test-rule-config-id');
  });

  it('should create a new rule', async () => {
    expect(
      await mockRuleService.create({
        cfg: 'Test',
        state: '01_ABANDONED',
        dataType: 'currency',
        desc: 'Test',
      }),
    ).toEqual({
      _id: 'rule/364ebb45-aca4-419b-a911-a7aa11f7710b',
      _key: '364ebb45-aca4-419b-a911-a7aa11f7710b',
      _rev: '_hl9VTsG---',
      cfg: 'Test',
      state: '01_ABANDONED',
      dataType: 'currency',
      desc: 'Test',
    });
  });
  it('should update a rule', async () => {
    const id = '364ebb45-aca4-419b-a911-a7aa11f7710b';
    expect(
      await mockRuleService.update(id, {
        cfg: 'Test',
        state: '01_ABANDONED',
        dataType: 'currency',
        desc: 'Test',
      }),
    ).toEqual({
      _id: 'rule/364ebb45-aca4-419b-a911-a7aa11f7710b',
      _key: '364ebb45-aca4-419b-a911-a7aa11f7710b',
      _rev: '_hl9VTsG---',
      cfg: 'Test',
      state: '01_ABANDONED',
      dataType: 'currency',
      desc: 'Test',
      originatedID: id,
    });
  });
});

it('should retrieve all rules', async () => {
  const rulename = 'test-rule-name';
  const expectedRules = {
    count: 1,
    RuleWithConfig: [
      {
        rule: {
          _key: 'test-rule-id',
          name: rulename,
          desc: 'Test Rule Description',
          cfg: '1.0.0',
          dataType: 'currency',
          ownerId: ''
        },
        ruleConfigs: [
          {
            _key: 'test-rule-config-id',
            cfg: '1.0.0',
            desc: 'Test Rule Config Description',
            ownerId: '',
            state: '01_DRAFT',
            config: {
              parameters: [],
              exitConditions: [],
              bands: [],
              cases: [],
            },
          },
        ],
      },
    ],
  ownerId: 'owner-id',
  state: '01_DRAFT',
  createdAt: '2021-08-02T00:00:00.000Z',
  updatedAt: '2021-08-02T00:00:00.000Z',
  updatedBy: 'user1',
  approverId: 'approver1',
  referenceId: 1,
  originatedId: null,
};
const result = await controller.findAll(rulename);

expect(mockRuleService.findAll).toHaveBeenCalledWith(rulename);
expect(result).toEqual(expectedRules);
});












