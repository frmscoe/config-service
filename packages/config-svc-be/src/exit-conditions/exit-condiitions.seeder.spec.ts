import { ExitConditionsSeeder } from './exit-conditions.seeder';
import { ArangoDatabaseService } from '../arango-database/arango-database.service';

describe('ExitConditionsSeeder - EC-005', () => {
  let seeder: ExitConditionsSeeder;
  let mockCollection: any;
  let mockDb: any;

  beforeEach(() => {
    mockCollection = {
      save: jest.fn().mockResolvedValue({}),
    };

    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
    };

    const mockArangoDatabaseService = {
      getDatabase: jest.fn().mockReturnValue(mockDb),
    };

    seeder = new ExitConditionsSeeder(mockArangoDatabaseService as any);
    // manually set db because we aren't calling `onModuleInit()` in the test
    (seeder as any).db = mockDb;
  });

  it('EC-005: Should seed system with default conditions', async () => {
    await seeder.seed();

    // Expect 4 calls for .x00, .x01, .x03, .x04
    expect(mockCollection.save).toHaveBeenCalledTimes(4);

    // Check one example call
    expect(mockCollection.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: '.x00',
        reason: expect.stringContaining('Unsuccessful transaction'),
        label: 'System Default',
        isUserDefault: true,
      }),
      { overwriteMode: 'update' }
    );
  });
});
