import { Test, TestingModule } from '@nestjs/testing';
import { NetworkMapService } from './network-map.service';
import { ArangoDatabaseService } from '../arango-database/arango-database.service';

describe('NetworkMapService', () => {
  let service: NetworkMapService;
  let dbMock: any;

  const mockCollection = {
    save: jest.fn(),
  };

  dbMock = {
    getDatabase: jest.fn(() => ({
      collection: jest.fn(() => mockCollection),
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
});
