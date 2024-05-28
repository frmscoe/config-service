import { Test, TestingModule } from '@nestjs/testing';
import { RuleController } from './rule.controller';
import { RuleService } from './rule.service';
import { CanActivate } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrivilegeService } from '../privilege/privilege.service';
import { RolesGuard } from '../auth/guards/roles.guard';

describe('RuleController', () => {
  let controller: RuleController;
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
  };
  const mockPrivilegeService = {};

  beforeEach(async () => {
    const mockAuthGuard: CanActivate = { canActivate: jest.fn(() => true) };
    const mockRolesGuard: CanActivate = { canActivate: jest.fn(() => true) };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RuleController],
      providers: [RuleService],
    })
      .overrideProvider(RuleService)
      .useValue(mockRuleService)
      .overrideGuard(JwtAuthGuard)
      .useValue(mockAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .overrideProvider(PrivilegeService)
      .useValue(mockPrivilegeService)
      .compile();

    controller = module.get<RuleController>(RuleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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
