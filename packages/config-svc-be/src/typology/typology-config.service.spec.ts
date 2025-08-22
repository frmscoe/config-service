// SPDX-License-Identifier: Apache-2.0
import { Test, TestingModule } from '@nestjs/testing';
import { TypologyService } from './typology.service';
import { ArangoDatabaseService } from '../arango-database/arango-database.service';
import { Request } from 'express';
import { BadRequestException } from '@nestjs/common';
import { TypologyStateEnum } from './enums/typology-state.enum';
import { CreateTypologyDto } from './dto/create-typology.dto';

describe('TypologyService - create()', () => {
  let service: TypologyService;
  let mockDb: any;
  let mockCollection: any;

  beforeEach(async () => {
    mockCollection = {
      save: jest.fn(),
    };

    mockDb = {
      collection: jest.fn(() => mockCollection),
    };

    const mockArangoService = {
      getDatabase: jest.fn(() => mockDb),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypologyService,
        {
          provide: ArangoDatabaseService,
          useValue: mockArangoService,
        },
      ],
    }).compile();

    service = module.get<TypologyService>(TypologyService);
  });

  // TRC-001
  it('should create a new typology and return the inserted entry', async () => {
    const dto: CreateTypologyDto = {
      name: 'Typology A',
      desc: 'Test description',
      cfg: '1.0.0',
      typologyCategoryUUID: ['cat-001'], 
      rules_rule_configs: [],
    };


    const mockRequest = {
      user: {
        username: 'tester_user',
      },
    } as unknown as Request;

    const expectedSaved = {
      ...dto,
      _key: 'generated-key',
      state: TypologyStateEnum['01_DRAFT'],
      ownerId: 'tester_user',
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    };

    mockCollection.save.mockResolvedValue({ new: expectedSaved });

    const result = await service.create(dto, mockRequest);

    expect(mockDb.collection).toHaveBeenCalledWith('typology');
    expect(mockCollection.save).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Typology A',
      desc: 'Test description',
      ownerId: 'tester_user',
      state: TypologyStateEnum['01_DRAFT'],
      _key: expect.any(String),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    }), { returnNew: true });

    expect(result).toEqual(expectedSaved);
  });

  // TRC-002a
  it('should throw BadRequestException when typology already exists', async () => {
    const dto: CreateTypologyDto = {
      name: 'Typology A',
      desc: 'Test description',
      cfg: '1.0.0',
      typologyCategoryUUID: ['cat-001'],
      rules_rule_configs: [],
    };


    const mockRequest = {
      user: {
        username: 'tester_user',
      },
    } as unknown as Request;

    const arangoError = {
      isArangoError: true,
      errorNum: 1210,
      message: 'duplicate',
    };

    mockCollection.save.mockRejectedValue(arangoError);

    await expect(service.create(dto, mockRequest)).rejects.toThrow(BadRequestException);
  });

  // TRC-002b
  it('TRC-002: preventDuplicateLinks() should throw if typology-rule-config link already exists', async () => {
    const typologyId = 'typology-abc';
    const ruleId = 'rule-xyz';

    const existingTypology = {
      _key: typologyId,
      name: 'Compliance Check',
      rules_rule_configs: [{ ruleId, ruleConfigId: [] }],
      updatedAt: new Date().toISOString(),
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

  // TRC-003 Not required

  // TRC-004a
  it('TRC-004: validateRuleConfigReference() should throw if any rule config UUID is invalid', async () => {
    const validUUIDs = ['cfg-001', 'cfg-002'];
    const invalidUUIDs = ['cfg-999'];

    const dbMock = {
      query: jest.fn().mockResolvedValue({
        all: jest.fn().mockResolvedValue(validUUIDs),
      }),
    };

    const arangoService = {
      getDatabase: () => dbMock,
    };

    const service = new TypologyService(arangoService as any);

    await expect(
      service.validateRuleConfigReference([...validUUIDs, ...invalidUUIDs]),
    ).rejects.toThrow('Invalid rule config UUID(s): cfg-999');
  });

  // TRC-004b
  it('TRC-004: validateRuleConfigReference() should pass if all UUIDs are valid', async () => {
    const uuids = ['cfg-001', 'cfg-002'];

    const dbMock = {
      query: jest.fn().mockResolvedValue({
        all: jest.fn().mockResolvedValue(uuids),
      }),
    };

    const arangoService = {
      getDatabase: () => dbMock,
    };

    const service = new TypologyService(arangoService as any);

    await expect(service.validateRuleConfigReference(uuids)).resolves.not.toThrow();
  });


});
