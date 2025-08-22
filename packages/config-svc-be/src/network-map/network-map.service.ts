// <!-- SPDX-License-Identifier: Apache-2.0 -->
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ArangoDatabaseService } from '../arango-database/arango-database.service';
import { CreateNetworkMapDto } from './dto/create-network-map.dto';
import { NetworkMap } from './entities/network-map.entity';
import { NetworkMapTransition } from './entities/network-map-transition.entity';
import { NETWORK_MAP_COLLECTION } from './schema/network-map.schema';
import { v4 as uuidv4 } from 'uuid';
import { StateEnum } from '../rule/schema/rule.schema';
import { UpdateNetworkMapDto } from './dto/update-network-map.dto';
import { aql } from 'arangojs';
import { NetworkMapStateEnum } from './enums/network-map-state.enum';

@Injectable()
export class NetworkMapService {
  constructor(private readonly arangoDatabaseService: ArangoDatabaseService) {}

  async findAll(pagination: { page: number; limit: number }, user: any) {
    const db = this.arangoDatabaseService.getDatabase(); // get DB instance
    const skip = (pagination.page - 1) * pagination.limit;
    const limit = pagination.limit;

    const itemsCursor = await db.query(aql`
      FOR map IN ${db.collection(NETWORK_MAP_COLLECTION)}
      SORT map.updatedAt DESC
      LIMIT ${skip}, ${limit}
      RETURN map
    `);
    const items = await itemsCursor.all();

    const countCursor = await db.query(aql`
      RETURN LENGTH(FOR map IN ${db.collection(NETWORK_MAP_COLLECTION)} RETURN 1)
    `);
    const total = await countCursor.next();

    return { items, total };
  }



  async create(
    // console.log('Received DTO:', createNetworkMapDto);

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

    const now = new Date().toISOString();
    
    const newNetworkMap: NetworkMap = {
      ...createNetworkMapDto,
      _key: uuidv4(),
      state: StateEnum['01_DRAFT'],
      ownerId: req['user'].username,
      createdAt: now,
      updatedAt: now,
      modifiedBy: req['user'].username,
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

  // async findOneByName(name: string): Promise<NetworkMap> {
  //   const db = this.arangoDatabaseService.getDatabase();

  //   try {
  //     // Query the collection to find the rule by name
  //     const cursor = await db.query(`FOR rule IN ${NETWORK_MAP_COLLECTION} FILTER network_map.name == @name RETURN network_map`, { name });
  //     const result = await cursor.all() 



  //     return result;
  //   } catch (e) {
  //     throw new InternalServerErrorException(e.message);
  //   }
  // }

  async findOneByName(name: string): Promise<NetworkMap> {
    const db = this.arangoDatabaseService.getDatabase();
    try {
      const cursor = await db.query(`
        FOR network_map IN ${NETWORK_MAP_COLLECTION}
        FILTER network_map.name == @name
        RETURN network_map
      `, { name });

      const result = await cursor.next(); // Get a single item, not an array
      if (!result) throw new NotFoundException(`Network map with name "${name}" not found`);

      return result;
    } catch (e) {
      // throw new InternalServerErrorException(e.message);
      throw new NotFoundException(`Network Map with name "${name}" not found`);
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

    const now = new Date().toISOString();

    const newNetworkMap: NetworkMap = {
      active,
      cfg,
      events,
      ...updateNetworkMapDto,
      _key: uuidv4(),
      name: updateNetworkMapDto.name,
      ownerId: req['user'].username,
      updatedAt: now,
      createdAt: now,
      modifiedBy: req['user'].username,
      state: StateEnum['01_DRAFT'],
      originatedId: id,
    };

    // Save the new network map
    try {
      const result = await collection.save(newNetworkMap, { returnNew: true });
      // await this.update(id, { edited: true });
      await this.updateNetworkMap(id, { edited: true }, req);
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


  async updateNetworkMap(
  id: string,
  updateNetworkMapDto: UpdateNetworkMapDto,
  req: Request,
): Promise<NetworkMap> {
  const db = this.arangoDatabaseService.getDatabase();
  const collection = db.collection(NETWORK_MAP_COLLECTION);

  // Fetch existing document
  const existing = await this.findOne(id);
  if (!existing) {
    throw new NotFoundException(`Network map with ID ${id} not found.`);
  }

  const now = new Date().toISOString();
  const updatedDoc: Partial<NetworkMap> = {
    ...existing,
    ...updateNetworkMapDto,
    updatedAt: now,
    modifiedBy: req['user']?.username || 'system',
  };

  try {
    const result = await collection.update(id, updatedDoc, {
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


async transitionNetworkMapState(
  id: string,
  newState: NetworkMapStateEnum,
  req: Request,
): Promise<NetworkMapTransition> {
  const db = this.arangoDatabaseService.getDatabase();
  const collection = db.collection('network_map');

  try {
    const documentKey = id.replace('network_map/', '').replace('network_maps/', '');
    const existing = await collection.document(documentKey);

    const updatedPayload = {
      state: newState,
      edited: true,
      updatedAt: new Date().toISOString(),
      modifiedBy: req['user']?.username || 'system',
    };

    const result = await collection.update(documentKey, updatedPayload, {
      returnNew: true,
    });

    const updated = result.new;

    return {
      _key: updated._key,
      state: updated.state,
      ownerId: updated.ownerId,
      updatedAt: updated.updatedAt,
      modifiedBy: updated.modifiedBy,
      edited: updated.edited,
    };
  } catch (e) {
    console.error('transitionNetworkMapState error:', e);
    throw new InternalServerErrorException(e.message || 'Transition failed.');
  }
}

async addTypologyToNetworkMap(
    networkMapId: string,
    typologyId: string,
    req: Request,
  ): Promise<any> {
    const db = this.arangoDatabaseService.getDatabase();

    const edgeCollectionName = 'network_map_typology_edges';

    try {
      const resultCursor = await db.query(aql`
        INSERT {
          _from: ${networkMapId},
          _to: ${typologyId},
          createdAt: ${new Date().toISOString()},
          createdBy: ${req['user']?.username || 'system'}
        } INTO ${db.collection(edgeCollectionName)}
        RETURN NEW
      `);

      const inserted = await resultCursor.next();
      return inserted;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to link typology to network map: ${error.message}`,
      );
    }
  }




}
