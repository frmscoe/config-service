import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ArangoDatabaseService } from '../arango-database/arango-database.service';
import { CreateNetworkMapDto } from './dto/create-network-map.dto';
import { NetworkMap } from './entities/network-map.entity';
import { NETWORK_MAP_COLLECTION } from './schema/network-map.schema';
import { v4 as uuidv4 } from 'uuid';
import { StateEnum } from '../rule/schema/rule.schema';

@Injectable()
export class NetworkMapService {
  constructor(private readonly arangoDatabaseService: ArangoDatabaseService) {}

  async create(
    createNetworkMapDto: CreateNetworkMapDto,
    req: Request,
  ): Promise<NetworkMap> {
    const db = this.arangoDatabaseService.getDatabase();
    const collection = db.collection(NETWORK_MAP_COLLECTION);

    // check if the username is present in the request
    if (!req['user'].username) {
      throw new BadRequestException(
        'Failed to create network map: username is missing',
      );
    }

    const newNetworkMap: NetworkMap = {
      ...createNetworkMapDto,
      _key: uuidv4(),
      state: StateEnum['01_DRAFT'],
      ownerId: req['user'].username,
    };

    try {
      const result = await collection.save(newNetworkMap, { returnNew: true });
      return result.new;
    } catch (error) {
      if (error.isArangoError) {
        switch (error.errorNum) {
          case 1620:
            throw new BadRequestException(
              `Failed to create network map: ${error.message}`,
            );
          default:
            throw new InternalServerErrorException(
              `An unexpected database error occurred: ${error.message}`,
            );
        }
      } else {
        throw new InternalServerErrorException(
          `An unexpected server error occurred: ${error.message}`,
        );
      }
    }
  }
}
