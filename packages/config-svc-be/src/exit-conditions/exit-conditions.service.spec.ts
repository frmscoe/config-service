import { Test, TestingModule } from '@nestjs/testing';
import { ExitConditionsService } from './exit-conditions.service';
import { ArangoDatabaseService } from '../arango-database/arango-database.service';
import { PrivilegeService } from '../privilege/privilege.service';
import { UserEmailMappingService } from '../user-mapping/user-email-mapping.service';
import { BadRequestException } from '@nestjs/common';
import { CreateExitConditionDto } from './dto/create-exit-condition.dto';
import { Request } from 'express';


describe('ExitConditionsService - EC-001', () => {
  let service: ExitConditionsService;
  let arangoDbService: any;
  let privilegeService: any;

  const mockCollection = {
    save: jest.fn(),
    document: jest.fn(),
  };

  const mockDb = {
    collection: jest.fn().mockResolvedValue(mockCollection),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExitConditionsService,
        {
          provide: ArangoDatabaseService,
          useValue: { getDatabase: () => mockDb },
        },
        {
          provide: PrivilegeService,
          useValue: {
            validateTokenAndClaims: jest.fn().mockResolvedValue({ valid: true }),
          },
        },
        {
          provide: UserEmailMappingService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ExitConditionsService>(ExitConditionsService);
    arangoDbService = module.get<ArangoDatabaseService>(ArangoDatabaseService);
    privilegeService = module.get<PrivilegeService>(PrivilegeService);
  });

  // EC-001
  it('EC-001: Should create exit condition with metadata', async () => {
    const token = 'mock-token';
    const now = new Date().toISOString();
    const dto: CreateExitConditionDto = {
      id: 'exit-1',
      reason: 'High Risk',
      description: 'Triggered when risk level is high',
      label: 'User Created',
      isUserDefault: true,
      exitId: 'exit-001',
    };

    // const mockReq = {
    //   user: {
    //     username: 'testuser',
    //   },
    // } as unknown as Request;
    const mockReq = {
      user: {
        username: 'testuser',
      },
    } as any;


    const mockMeta = { _key: 'exit-001' };

    const savedDoc = {
      ...dto,
      _key: 'exit-001',
      createdBy: 'testuser',
      updatedBy: 'testuser',
      createdAt: now,
      updatedAt: now,
    };

    mockCollection.save.mockResolvedValue(mockMeta);
    mockCollection.document.mockResolvedValue(savedDoc);

    const result = await service.create(dto, token, mockReq);

    expect(result).toMatchObject({
      id: 'exit-1',
      reason: 'High Risk',
      description: 'Triggered when risk level is high',
      label: 'User Created',
      createdBy: 'testuser',
      updatedBy: 'testuser',
      isUserDefault: true,
      userDefined: true,
      isSystemDefault: false,
      canDelete: true,
    });

    expect(mockCollection.save).toHaveBeenCalledWith(expect.objectContaining({
      id: 'exit-1',
      reason: 'High Risk',
      createdBy: 'testuser',
      updatedBy: 'testuser',
      isUserDefault: true,
    }), expect.any(Object));

    expect(mockCollection.document).toHaveBeenCalledWith('exit-001');
  });

  // EC-002
    it('EC-002: Should retrieve user-specific exit conditions', async () => {
    const token = 'mock-token';
    const ownerId = 'user-123';
    const exitConditionId = 'exit-001';

    // Mock privilege check
    privilegeService.validateTokenAndClaims.mockResolvedValue({ valid: true });

    // Mock Arango collections
    const mockUserDefaultsCollection = {
      document: jest.fn().mockResolvedValue({
        _key: ownerId,
        ownerId,
        defaultExitConditionId: exitConditionId,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      }),
    };

    const mockExitConditionsCollection = {
      document: jest.fn().mockResolvedValue({
        id: exitConditionId,
        reason: 'Fraudulent Activity',
        description: 'Triggered on suspicious transactions',
        label: 'User Created',
        isUserDefault: true,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        createdBy: 'testuser',
        updatedBy: 'testuser',
      }),
    };

    // Swap getCollection based on name
    mockDb.collection.mockImplementation((name: string) => {
      if (name === 'userExitDefaults') return Promise.resolve(mockUserDefaultsCollection);
      if (name === 'exitConditions') return Promise.resolve(mockExitConditionsCollection);
      throw new Error(`Unexpected collection name: ${name}`);
    });

    const result = await service.getDefaultExitConditionForUser(ownerId, token);

    expect(result).toMatchObject({
      id: exitConditionId,
      reason: 'Fraudulent Activity',
      description: 'Triggered on suspicious transactions',
      label: 'User Created',
      isUserDefault: true,
      userDefined: true,
      isSystemDefault: false,
      canDelete: true,
    });

    expect(mockUserDefaultsCollection.document).toHaveBeenCalledWith(ownerId);
    expect(mockExitConditionsCollection.document).toHaveBeenCalledWith(exitConditionId);
  });

    // EC-003
    it('EC-003: Should throw ConflictException if reason already exists', async () => {
    const token = 'mock-token';
    const dto: CreateExitConditionDto = {
      id: 'exit-dup',
      reason: 'Duplicate Reason',
      description: 'Already exists in DB',
      label: 'User Created',
      isUserDefault: true,
      exitId: 'exit-dup-001',
    };

    const mockReq = {
      user: {
        username: 'testuser',
      },
    } as any;

    const duplicateReasonError = {
      response: {
        errorNum: 1210,
        errorMessage: 'reason already exists',
      },
    };

    const mockCollection = {
      save: jest.fn().mockRejectedValue(duplicateReasonError),
    };

    mockDb.collection.mockResolvedValue(mockCollection);

    await expect(service.create(dto, token, mockReq)).rejects.toThrow(
      `Exit condition with reason "${dto.reason}" already exists.`
    );
  });


});
