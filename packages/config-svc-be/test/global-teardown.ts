import { ArangoDatabaseService } from '../src/arango-database/arango-database.service';

export default async () => {
  const arangoService = new ArangoDatabaseService();
  await arangoService.truncateCollections();
};
