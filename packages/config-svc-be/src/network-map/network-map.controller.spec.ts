import { Test, TestingModule } from '@nestjs/testing';
import { NetworkMapController } from './network-map.controller';
import { NetworkMapService } from './network-map.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PrivilegeService } from '../privilege/privilege.service';
import { CreateNetworkMapDto } from './dto/create-network-map.dto';
import { NetworkMap } from './entities/network-map.entity';
import { StateEnum } from '../rule/schema/rule.schema';
import { UpdateNetworkMapDto } from './dto/update-network-map.dto';

describe('NetworkMapController', () => {
  let controller: NetworkMapController;
  let service: NetworkMapService;

  const mockNetworkMapService = {
    create: jest.fn((dto, req) => ({
      ...dto,
      ownerId: req.user.username,
      _key: 'generated-id',
      state: '01_DRAFT',
    })),
    findOne: jest.fn((id) => ({
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
      state: '01_DRAFT',
      createdAt: '2021-08-02T14:00:00Z',
      updatedAt: '2021-08-02T14:00:00Z',
    })),
    duplicateNetworkMap: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NetworkMapController],
      providers: [
        { provide: NetworkMapService, useValue: mockNetworkMapService },
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

    controller = module.get<NetworkMapController>(NetworkMapController);
    service = module.get<NetworkMapService>(NetworkMapService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new network map', async () => {
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

      const req = {
        user: {
          clientId: 'test-client-id',
          username: 'test-user@example.com',
          participantRoleIds: undefined,
          platformRoleIds: [1],
        },
      };

      const result = await controller.create(createNetworkMapDto, req as any);
      expect(service.create).toHaveBeenCalledWith(createNetworkMapDto, req);
      expect(result).toEqual({
        ...createNetworkMapDto,
        ownerId: 'test-user@example.com',
        _key: 'generated-id',
        state: '01_DRAFT',
      });
    });
  });

  describe('findOne', () => {
    it('should retrieve a network map by ID', async () => {
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

      // Act
      const result = await controller.findOne(id);

      // Assert
      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(result).toEqual(expectedNetworkMap);
    });
  });

  describe('update', () => {
    it('should update a network map by ID', async () => {
      const id = 'test-network-map-id';
      const updateNetworkMapDto: UpdateNetworkMapDto = {
        active: true,
        cfg: '2.0.0',
      };
      const req = { user: { username: 'user@example.com' } };

      const expectedNetworkMap: NetworkMap = {
        _key: 'test-network-map-id',
        active: true,
        cfg: '2.0.0',
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

      mockNetworkMapService.duplicateNetworkMap.mockResolvedValue(
        expectedNetworkMap,
      );

      // Act
      const result = await controller.update(id, updateNetworkMapDto, req);

      // Assert
      expect(mockNetworkMapService.duplicateNetworkMap).toHaveBeenCalledWith(
        id,
        updateNetworkMapDto,
        req,
      );
      expect(result).toEqual(expectedNetworkMap);
    });
  });
});
