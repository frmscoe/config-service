import { Test, TestingModule } from '@nestjs/testing';
import { TypologyService } from './typology.service';
import { ArangoDatabaseService } from '../arango-database/arango-database.service';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateTypologyDto } from './dto/create-typology.dto';
import { TypologyRuleWithConfigs } from './entities/typology.entity';
import { MockArangoError } from '../../test/mocks/mock-arango-error';

describe('TypologyService', () => {
  let service: TypologyService;
  let dbMock: any;

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    beforeEach(async () => {
      const mockCollection = {
        save: jest.fn(),
      };

      dbMock = {
        getDatabase: jest.fn(() => ({
          collection: jest.fn(() => mockCollection),
        })),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          TypologyService,
          { provide: ArangoDatabaseService, useValue: dbMock },
        ],
      }).compile();

      service = module.get<TypologyService>(TypologyService);
    });

    it('should create and return new typology', async () => {
      const createTypologyDto: CreateTypologyDto = {
        name: 'New Typology',
        desc: 'Description for new typology',
        cfg: '1.0.0',
        typologyCategoryUUID: ['uuid1'],
        rules_rule_configs: [
          {
            ruleId: 'rule/sample-uuid-3',
            ruleConfigId: [
              'rule_config/sample-uuid-4',
              'rule_config/sample-uuid-5',
            ],
          },
        ],
      };
      const req = { user: { username: 'user1' } };

      const expectedMockDbResult = {
        _key: 'generated-id',
        new: {
          ...createTypologyDto,
          ownerId: req['user'].username,
          _key: expect.any(String),
          state: '01_DRAFT',
        },
      };

      const expectedSaveResult = {
        ...createTypologyDto,
        ownerId: req['user'].username,
        _key: expect.any(String),
        state: '01_DRAFT',
      };

      dbMock
        .getDatabase()
        .collection()
        .save.mockResolvedValue(expectedMockDbResult);

      // Act
      const result = await service.create(createTypologyDto, req as any);

      // Assert
      expect(dbMock.getDatabase().collection().save).toHaveBeenCalledWith(
        expectedSaveResult,
        { returnNew: true },
      );
      expect(result).toEqual(expectedSaveResult);
    });

    it('should throw BadRequestException if username is missing', async () => {
      const createTypologyDto: CreateTypologyDto = {
        name: 'Typology without user',
        desc: 'No user attached',
        cfg: '1.0.0',
        typologyCategoryUUID: ['uuid1'],
        rules_rule_configs: [],
      };
      const req = { user: {} }; // Empty user object

      await expect(
        service.create(createTypologyDto, req as any),
      ).rejects.toThrow(
        new BadRequestException(
          'Failed to create typology: username is missing',
        ),
      );
    });

    it('should handle database save errors', async () => {
      const createTypologyDto: CreateTypologyDto = {
        name: 'New Typology',
        desc: 'This should fail on save',
        cfg: '1.0.0',
        typologyCategoryUUID: ['uuid1'],
        rules_rule_configs: [],
      };
      const req = { user: { username: 'user1' } };

      const arangoError: MockArangoError = new MockArangoError(
        'Database save error',
        1620,
      );

      dbMock.getDatabase().collection().save.mockRejectedValue(arangoError);

      await expect(
        service.create(createTypologyDto, req as any),
      ).rejects.toThrow(
        new BadRequestException(
          'Failed to create typology: Database save error',
        ),
      );
    });

    it('should handle unspecified ArangoDB errors as internal server errors', async () => {
      const createTypologyDto: CreateTypologyDto = {
        name: 'New Typology',
        desc: 'This should fail on save',
        cfg: '1.0.0',
        typologyCategoryUUID: ['uuid1'],
        rules_rule_configs: [],
      };
      const req = { user: { username: 'user1' } };

      const arangoError: MockArangoError = new MockArangoError(
        'Unspecified ArangoDB error',
        9999, // An unspecified error number
      );

      dbMock.getDatabase().collection().save.mockRejectedValue(arangoError);

      await expect(
        service.create(createTypologyDto, req as any),
      ).rejects.toThrow(
        new InternalServerErrorException(
          'An unexpected database error occurred: Unspecified ArangoDB error',
        ),
      );
    });

    it('should handle non-ArangoDB errors as internal server errors', async () => {
      const createTypologyDto: CreateTypologyDto = {
        name: 'Another Typology',
        desc: 'This should also fail on save',
        cfg: '1.0.0',
        typologyCategoryUUID: ['uuid2'],
        rules_rule_configs: [],
      };
      const req = { user: { username: 'user2' } };

      const genericError: Error = new Error('Generic save error');

      dbMock.getDatabase().collection().save.mockRejectedValue(genericError);

      await expect(
        service.create(createTypologyDto, req as any),
      ).rejects.toThrow(
        new InternalServerErrorException(
          'An unexpected server error occurred: Generic save error',
        ),
      );
    });
  });

  describe('findAll', () => {
    beforeEach(async (): Promise<void> => {
      const mockCursor = {
        next: jest.fn().mockResolvedValue({
          count: 2,
          page: 1,
          countInPage: 2,
          data: [
            { _key: '123', name: 'Typology 1', state: '01_DRAFT' },
            { _key: '456', name: 'Typology 2', state: '01_DRAFT' },
          ],
        }),
      };

      dbMock = {
        getDatabase: jest.fn(() => ({
          query: jest.fn(() => Promise.resolve(mockCursor)),
        })),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          TypologyService,
          { provide: ArangoDatabaseService, useValue: dbMock },
        ],
      }).compile();

      service = module.get<TypologyService>(TypologyService);
    });

    it('should return paginated typologies', async () => {
      const options = { page: 1, limit: 10 };
      const expectedTypologies = {
        count: 2,
        page: 1,
        countInPage: 2,
        data: [
          { _key: '123', name: 'Typology 1', state: '01_DRAFT' },
          { _key: '456', name: 'Typology 2', state: '01_DRAFT' },
        ],
      };

      const result = await service.findAll(options);
      expect(result).toEqual(expectedTypologies);
    });
  });

  describe('findOne', () => {
    beforeEach(async (): Promise<void> => {
      const mockCursor = {
        next: jest.fn().mockResolvedValue({
          _key: 'test-typology-id',
          name: 'Test Typology',
          desc: 'Test Typology Description',
          cfg: '1.0.0',
          typologyCategoryUUID: ['test-category-uuid-1'],
          rules_rule_configs: [],
          ruleWithConfigs: [
            {
              rule: {
                _id: 'rule/sample-uuid-3',
                _key: 'sample-uuid-3',
                name: 'Rule 3',
                cfg: '1.0.0',
              },
              ruleConfigs: [
                {
                  _id: 'rule_config/sample-uuid-4',
                  _key: 'sample-uuid-4',
                  cfg: '1.0.0',
                  ruleId: 'rule/sample-uuid-3',
                  config: {
                    parameters: [],
                    exitConditions: [],
                    bands: [],
                    cases: [],
                  },
                },
                {
                  _id: 'rule_config/sample-uuid-5',
                  _key: 'sample-uuid-5',
                  cfg: '1.0.0',
                  ruleId: 'rule/sample-uuid-3',
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
        }),
      };

      dbMock = {
        getDatabase: jest.fn(() => ({
          query: jest.fn(() => Promise.resolve(mockCursor)),
        })),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          TypologyService,
          { provide: ArangoDatabaseService, useValue: dbMock },
        ],
      }).compile();

      service = module.get<TypologyService>(TypologyService);
    });

    it('should return a typology when found', async () => {
      const typology: TypologyRuleWithConfigs = {
        _key: 'test-typology-id',
        name: 'Test Typology',
        desc: 'Test Typology Description',
        cfg: '1.0.0',
        typologyCategoryUUID: ['test-category-uuid-1'],
        rules_rule_configs: [],
        ruleWithConfigs: [
          {
            rule: {
              _id: 'rule/sample-uuid-3',
              _key: 'sample-uuid-3',
              name: 'Rule 3',
              cfg: '1.0.0',
            },
            ruleConfigs: [
              {
                _id: 'rule_config/sample-uuid-4',
                _key: 'sample-uuid-4',
                cfg: '1.0.0',
                ruleId: 'rule/sample-uuid-3',
                config: {
                  parameters: [],
                  exitConditions: [],
                  bands: [],
                  cases: [],
                },
              },
              {
                _id: 'rule_config/sample-uuid-5',
                _key: 'sample-uuid-5',
                cfg: '1.0.0',
                ruleId: 'rule/sample-uuid-3',
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

      // Act
      const result = await service.findOne('test-typology-id');

      // Assert
      expect(result).toEqual(typology);
    });
  });
});
