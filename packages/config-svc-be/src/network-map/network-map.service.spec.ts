import { Test, TestingModule } from '@nestjs/testing';
import { NetworkMapService } from './network-map.service';
import { ArangoDatabaseService } from '../arango-database/arango-database.service';
import { NetworkMap } from './entities/network-map.entity';
import { StateEnum } from '../rule/schema/rule.schema';
import { CreateNetworkMapDto } from './dto/create-network-map.dto';
import { UpdateNetworkMapDto } from './dto/update-network-map.dto';

describe('NetworkMapService', () => {
  let service: NetworkMapService;

  const mockCollection = {
    save: jest.fn(),
    document: jest.fn(),
    update: jest.fn(),
  };

  const mockCursor = {
    all: jest.fn().mockResolvedValue([]),
  };

  const dbMock = {
    getDatabase: jest.fn(() => ({
      collection: jest.fn(() => mockCollection),
      query: jest.fn(() => Promise.resolve(mockCursor)),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NetworkMapService,
        { provide: ArangoDatabaseService, useValue: dbMock },
      ],
    }).compile();

    service = module.get<NetworkMapService>(NetworkMapService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new network map and return', async () => {
      const createNetworkMapDto: CreateNetworkMapDto = {
        active: true,
        cfg: '1.0.0',
        events: [
          {
            eventId: 'event/test-event-id',
            typologies: [],
          },
        ],
      };
      const req = { user: { username: 'user1' } };

      const expectedSaveResult = {
        ...createNetworkMapDto,
        ownerId: 'user1',
        _key: expect.any(String),
        state: StateEnum['01_DRAFT'],
      };

      dbMock
        .getDatabase()
        .collection()
        .save.mockResolvedValue({ new: expectedSaveResult });

      // Act
      const result = await service.create(createNetworkMapDto, req as any);

      // Assert
      expect(result).toEqual(expectedSaveResult);
    });
  });

  describe('findOne', () => {
    it('should return a network map by ID', async () => {
      const id = 'test-network-map-id';
      const expectedNetworkMap: NetworkMap = {
        _key: 'test-network-map-id',
        active: true,
        cfg: '1.0.0',
        events: [
          {
            eventId: 'event/test-event-id',
            typologies: [],
          },
        ],
        ownerId: 'user@example.com',
        state: StateEnum['01_DRAFT'],
        createdAt: '2021-08-02T14:00:00Z',
        updatedAt: '2021-08-02T14:00:00Z',
      };

      // Mock the collection save method
      dbMock
        .getDatabase()
        .collection()
        .document.mockResolvedValue(expectedNetworkMap);

      // Act
      const result = await service.findOne(id);

      // Assert
      expect(result).toEqual(expectedNetworkMap);
    });
  });

  describe('duplicateNetworkMap', () => {
    it('should duplicate a network map by ID', async () => {
      const id: string = 'test-network-map-id';
      const updateNetworkMapDto: UpdateNetworkMapDto = {
        active: true,
        cfg: '2.0.0',
      };
      const req = { user: { username: 'user_2@example.com' } };

      const expectedNetworkMap: NetworkMap = {
        _key: 'new-test-network-map-id',
        active: true,
        cfg: '2.0.0',
        events: [
          {
            eventId: 'event/test-event-id',
            typologies: [],
          },
        ],
        ownerId: 'user_2@example.com',
        updatedBy: 'user_2@example.com',
        state: StateEnum['01_DRAFT'],
        createdAt: '2021-08-02T14:00:00Z',
        updatedAt: '2021-08-02T14:00:00Z',
      };

      // Mock the findOne method
      dbMock.getDatabase().collection().document.mockResolvedValue(true);

      // Mock the query method
      dbMock.getDatabase().query.mockResolvedValue(mockCursor);

      // Mock the save method
      dbMock
        .getDatabase()
        .collection()
        .save.mockResolvedValue({ new: expectedNetworkMap });

      // Mock the collection update method
      dbMock.getDatabase().collection().update.mockResolvedValue(true);

      // Act
      const result = await service.duplicateNetworkMap(
        id,
        updateNetworkMapDto,
        req as any,
      );

      // Assert
      expect(result).toEqual(expectedNetworkMap);
    });
  });
});
