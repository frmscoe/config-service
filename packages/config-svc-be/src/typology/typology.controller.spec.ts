import { Test, TestingModule } from '@nestjs/testing';
import { TypologyController } from './typology.controller';
import { TypologyService } from './typology.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PrivilegeService } from '../privilege/privilege.service';
import { CreateTypologyDto } from './dto/create-typology.dto';

describe('TypologyController', () => {
  let controller: TypologyController;
  let service: TypologyService;

  const mockTypologyService = {
    create: jest.fn((dto, req) => ({
      ...dto,
      ownerId: req.user.username,
      _key: 'generated-id',
      state: '01_DRAFT',
    })),
    findAll: jest.fn(() => ({
      count: 2,
      data: [
        {
          _key: 'test-typology-id-1',
          name: 'Test Typology 1',
          desc: 'Test Typology Description 1',
          cfg: '1.0.0',
          typologyCategoryUUID: [
            'test-category-uuid-1',
          ],
          rules_rule_configs: [],
          ownerId: 'user@xample.com',
          state: '01_DRAFT',
        },
        {
          _key: 'test-typology-id-2',
          name: 'Test Typology 2',
          desc: 'Test Typology Description 2',
          cfg: '1.0.0',
          typologyCategoryUUID: [
            'test-category-uuid-1',
          ],
          rules_rule_configs: [],
          ownerId: 'user2@example.com',
          state: '01_DRAFT',
        },
      ],
    })),
    findOne: jest.fn((id) => ({
      _key: id,
      name: 'Test Typology',
      desc: 'Test Typology Description',
      cfg: '1.0.0',
      typologyCategoryUUID: ['test-category-uuid-1'],
      rules_rule_configs: [],
      ownerId: 'test-user@example.com',
      state: '01_DRAFT',
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TypologyController],
      providers: [
        { provide: TypologyService, useValue: mockTypologyService },
        {
          provide: JwtAuthGuard,
          useValue: { canActivate: jest.fn(() => true) },
        },
        {
          provide: RolesGuard,
          useValue: { canActivate: jest.fn(() => true) },
        },
        { provide: PrivilegeService, useValue: {} },
      ],
    }).compile();

    controller = module.get<TypologyController>(TypologyController);
    service = module.get<TypologyService>(TypologyService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a new typology', async () => {
    const createTypologyDto: CreateTypologyDto = {
      name: 'Test Typology',
      desc: 'Test Typology Description',
      cfg: '1.0.0',
      typologyCategoryUUID: ['test-category-uuid-1', 'test-category-uuid-2'],
      rules_rule_configs: [],
    };

    const req = {
      user: {
        clientId: 'test-client-id',
        username: 'test-user@example.com',
        participantRoleIds: undefined,
        platformRoleIds: [1],
      },
    };

    const result = await controller.create(createTypologyDto, req as any);
    expect(service.create).toHaveBeenCalledWith(createTypologyDto, req);
    expect(result).toEqual({
      ...createTypologyDto,
      ownerId: 'test-user@example.com',
      _key: 'generated-id',
      state: '01_DRAFT',
    });
  });

  it('should retrieve all typologies', async () => {
    const expectedTypologies = [
      {
        _key: 'test-typology-id-1',
        name: 'Test Typology 1',
        desc: 'Test Typology Description 1',
        cfg: '1.0.0',
        typologyCategoryUUID: [
          'test-category-uuid-1',
        ],
        rules_rule_configs: [],
        ownerId: 'user@xample.com',
        state: '01_DRAFT',
      },
      {
        _key: 'test-typology-id-2',
        name: 'Test Typology 2',
        desc: 'Test Typology Description 2',
        cfg: '1.0.0',
        typologyCategoryUUID: [
          'test-category-uuid-1',
        ],
        rules_rule_configs: [],
        ownerId: 'user2@example.com',
        state: '01_DRAFT',
      },
    ];

    const expectedResponse = {
      count: 2,
      data: expectedTypologies,
    };

    // Act
    const result = await controller.findAll(1, 10);

    // Assert
    expect(service.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
    expect(result).toEqual(expectedResponse);
  });

  it('should retrieve a single typology', async () => {
    const typologyId = 'test-typology-id';
    const expectedTypology = {
      _key: typologyId,
      name: 'Test Typology',
      desc: 'Test Typology Description',
      cfg: '1.0.0',
      typologyCategoryUUID: ['test-category-uuid-1'],
      rules_rule_configs: [],
      ownerId: 'test-user@example.com',
      state: '01_DRAFT',
    };

    // Act
    const result = await controller.findOne(typologyId);

    // Assert
    expect(service.findOne).toHaveBeenCalledWith(typologyId);
    expect(result).toEqual(expectedTypology);
  });
});
