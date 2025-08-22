import { NetworkMapService } from './network-map.service';
import { NetworkMapStateEnum } from './enums/network-map-state.enum';
import { Test, TestingModule } from '@nestjs/testing';
import { ArangoDatabaseService } from '../arango-database/arango-database.service';
import { BadRequestException } from '@nestjs/common';
import { CreateNetworkMapDto } from './dto/create-network-map.dto';
import { StateEnum } from '../rule/schema/rule.schema';


// Transition WF-001 through WF-010
describe('NetworkMapService - Workflow Transitions', () => {
  let service: NetworkMapService;
  const mockCollection = { document: jest.fn(), update: jest.fn() };
  const mockDB = { collection: () => mockCollection };
  const mockArangoService = { getDatabase: () => mockDB };

  const mockReq = { user: { username: 'tester' } } as any;
  const networkMapId = 'network_map/001';

  beforeEach(() => {
    service = new NetworkMapService(mockArangoService as any);
    jest.clearAllMocks();
  });

  const setupDocument = (state: keyof typeof NetworkMapStateEnum) => {
    mockCollection.document.mockResolvedValue({
      _key: '001',
      state: NetworkMapStateEnum[state],
      ownerId: 'tester',
    });
  };

  it('should transition from 01_DRAFT to 10_PENDING_REVIEW', async () => {
    setupDocument('01_DRAFT');
    mockCollection.update.mockResolvedValue({
      new: {
        _key: '001',
        state: NetworkMapStateEnum['10_PENDING_REVIEW'],
        ownerId: 'tester',
        updatedAt: new Date().toISOString(),
        modifiedBy: 'tester',
        edited: true,
      },
    });

    const result = await service.transitionNetworkMapState(
      networkMapId,
      NetworkMapStateEnum['10_PENDING_REVIEW'],
      mockReq,
    );

    expect(result.state).toBe(NetworkMapStateEnum['10_PENDING_REVIEW']);
    expect(result.modifiedBy).toBe('tester');
  });

  it('should transition from 10_PENDING_REVIEW to 20_APPROVED', async () => {
    setupDocument('10_PENDING_REVIEW');
    mockCollection.update.mockResolvedValue({
      new: {
        _key: '001',
        state: NetworkMapStateEnum['20_APPROVED'],
        ownerId: 'tester',
        updatedAt: new Date().toISOString(),
        modifiedBy: 'tester',
        edited: true,
      },
    });

    const result = await service.transitionNetworkMapState(
      networkMapId,
      NetworkMapStateEnum['20_APPROVED'],
      mockReq,
    );

    expect(result.state).toBe(NetworkMapStateEnum['20_APPROVED']);
  });

  it('should transition from 20_APPROVED to 30_DEPLOYED', async () => {
    setupDocument('20_APPROVED');
    mockCollection.update.mockResolvedValue({
      new: {
        _key: '001',
        state: NetworkMapStateEnum['30_DEPLOYED'],
        ownerId: 'tester',
        updatedAt: new Date().toISOString(),
        modifiedBy: 'tester',
        edited: true,
      },
    });

    const result = await service.transitionNetworkMapState(
      networkMapId,
      NetworkMapStateEnum['30_DEPLOYED'],
      mockReq,
    );

    expect(result.state).toBe(NetworkMapStateEnum['30_DEPLOYED']);
  });

  it('should transition from 30_DEPLOYED to 32_RETIRED', async () => {
    setupDocument('30_DEPLOYED');
    mockCollection.update.mockResolvedValue({
      new: {
        _key: '001',
        state: NetworkMapStateEnum['32_RETIRED'],
        ownerId: 'tester',
        updatedAt: new Date().toISOString(),
        modifiedBy: 'tester',
        edited: true,
      },
    });

    const result = await service.transitionNetworkMapState(
      networkMapId,
      NetworkMapStateEnum['32_RETIRED'],
      mockReq,
    );

    expect(result.state).toBe(NetworkMapStateEnum['32_RETIRED']);
  });

  it('should transition from 32_RETIRED to 91_ARCHIVED', async () => {
    setupDocument('32_RETIRED');
    mockCollection.update.mockResolvedValue({
      new: {
        _key: '001',
        state: NetworkMapStateEnum['91_ARCHIVED'],
        ownerId: 'tester',
        updatedAt: new Date().toISOString(),
        modifiedBy: 'tester',
        edited: true,
      },
    });

    const result = await service.transitionNetworkMapState(
      networkMapId,
      NetworkMapStateEnum['91_ARCHIVED'],
      mockReq,
    );

    expect(result.state).toBe(NetworkMapStateEnum['91_ARCHIVED']);
  });
});


describe('NetworkMapService', () => {
  let service: NetworkMapService;
  let mockCollectionSave: jest.Mock;
  let mockDb: any;

  beforeEach(async () => {
    mockCollectionSave = jest.fn();

    mockDb = {
      collection: jest.fn().mockReturnValue({
        save: mockCollectionSave,
      }),
    };

    const mockArangoDbService = {
      getDatabase: jest.fn().mockReturnValue(mockDb),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NetworkMapService,
        {
          provide: ArangoDatabaseService,
          useValue: mockArangoDbService,
        },
      ],
    }).compile();

    service = module.get<NetworkMapService>(NetworkMapService);
  });

  it('NM-001: Should create network map with valid structure', async () => {
    const dto: CreateNetworkMapDto = {
      name: 'Test Map',
      // desc: 'A valid test network map',
      active: true,
      cfg: '1.0.0',
      events: [],
    };

    const req = {
      user: {
        username: 'test_user',
      },
    } as any;

    const mockSavedMap = {
      new: {
        ...dto,
        _key: 'mocked-key',
        state: StateEnum['01_DRAFT'],
        ownerId: 'test_user',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        modifiedBy: 'test_user',
      },
    };

    mockCollectionSave.mockResolvedValue(mockSavedMap);

    const result = await service.create(dto, req);

    expect(mockDb.collection).toHaveBeenCalled();
    expect(mockCollectionSave).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Test Map',
      ownerId: 'test_user',
      state: StateEnum['01_DRAFT'],
    }), { returnNew: true });

    expect(result).toEqual(expect.objectContaining({
      name: 'Test Map',
      ownerId: 'test_user',
      state: StateEnum['01_DRAFT'],
      modifiedBy: 'test_user',
      _key: 'mocked-key',
    }));
  });

  it('should throw BadRequestException if username is missing', async () => {
    const dto: CreateNetworkMapDto = {
      name: 'Invalid Map',
      // desc: '',
      active: false,
      cfg: '1.0.0',
      events: [],
    };

    const req = {
      user: {},
    } as any;

    await expect(service.create(dto, req)).rejects.toThrow(BadRequestException);
  });

  // NM-002
  it('NM-002: Should link typology to network map', async () => {
    const mockQuery = jest.fn();
    const mockNext = jest.fn().mockResolvedValue({
      _from: 'network_map/abc123',
      _to: 'typology/xyz789',
      createdAt: expect.any(String),
      createdBy: 'test_user',
    });

    const mockDb = {
      collection: jest.fn().mockReturnValue({}), // for edge collection
      query: mockQuery.mockResolvedValue({ next: mockNext }),
    };

    const mockArangoDbService = {
      getDatabase: () => mockDb,
    };

    const mockReq = {
      user: {
        username: 'test_user',
      },
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NetworkMapService,
        {
          provide: ArangoDatabaseService,
          useValue: mockArangoDbService,
        },
      ],
    }).compile();

    const service = module.get<NetworkMapService>(NetworkMapService);

    const result = await service.addTypologyToNetworkMap(
      'network_map/abc123',
      'typology/xyz789',
      mockReq,
    );

    expect(mockQuery).toHaveBeenCalled();
    expect(result).toEqual(
      expect.objectContaining({
        _from: 'network_map/abc123',
        _to: 'typology/xyz789',
        createdBy: 'test_user',
      })
    );
  });

});

