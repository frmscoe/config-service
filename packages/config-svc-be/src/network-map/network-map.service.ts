import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ArangoDatabaseService } from '../arango-database/arango-database.service';
import { CreateNetworkMapDto } from './dto/create-network-map.dto';
import { NetworkMap } from './entities/network-map.entity';
import { NETWORK_MAP_COLLECTION } from './schema/network-map.schema';
import { v4 as uuidv4 } from 'uuid';
import { StateEnum } from '../rule/schema/rule.schema';
import { UpdateNetworkMapDto } from './dto/update-network-map.dto';

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

  async findOne(id: string): Promise<NetworkMap> {
    const db = this.arangoDatabaseService.getDatabase();

    try {
      return await db.collection(NETWORK_MAP_COLLECTION).document(id);
    } catch (error) {
      throw new NotFoundException(`No network map found with ID ${id}.`);
    }
  }

  async duplicateNetworkMap(
    id: string,
    updateNetworkMapDto: UpdateNetworkMapDto,
    req: Request,
  ): Promise<NetworkMap> {
    const db = this.arangoDatabaseService.getDatabase();
    const collection = db.collection(NETWORK_MAP_COLLECTION);

    // Fetch the existing network map
    const existingNetworkMap = await this.findOne(id);
    if (!existingNetworkMap) {
      throw new NotFoundException(`Network map with ID ${id} not found.`);
    }

    // Check for existing network map with the same originatedId
    const cursor = await db.query(
      `FOR network_map IN @@collection
       FILTER network_map.originatedId == @id
       LIMIT 1
       RETURN network_map`,
      { '@collection': NETWORK_MAP_COLLECTION, id: id },
    );
    const childNetworkMap = await cursor.all();

    if (childNetworkMap.length > 0) {
      throw new BadRequestException(
        `Could not update network map with ID ${id}: a network map already updated.`,
      );
    }

    // Prepare the new typology
    const { active, cfg, events } = existingNetworkMap;

    const newNetworkMap: NetworkMap = {
      active,
      cfg,
      events,
      ...updateNetworkMapDto,
      _key: uuidv4(),
      ownerId: req['user'].username,
      updatedBy: req['user'].username,
      state: StateEnum['01_DRAFT'],
      originatedId: id,
    };

    // Save the new network map
    try {
      const result = await collection.save(newNetworkMap, { returnNew: true });
      await this.update(id, { edited: true });
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

  async update(
    id: string,
    updateNetworkMapDto: UpdateNetworkMapDto,
  ): Promise<void> {
    const db = this.arangoDatabaseService.getDatabase();
    const collection = db.collection(NETWORK_MAP_COLLECTION);

    // Check if the network map exists
    await this.findOne(id);

    try {
      const result = await collection.update(id, updateNetworkMapDto, {
        returnNew: true,
      });
      return result.new;
    } catch (error) {
      if (error.isArangoError) {
        switch (error.errorNum) {
          case 1620:
            throw new BadRequestException(
              `Failed to update network map: ${error.message}`,
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
