import { Module } from '@nestjs/common';
import { NetworkMapController } from './network-map.controller';
import { NetworkMapService } from './network-map.service';
import { ArangoDatabaseService } from '../arango-database/arango-database.service';
import { PrivilegeService } from '../privilege/privilege.service';

@Module({
  controllers: [NetworkMapController],
  providers: [NetworkMapService, ArangoDatabaseService, PrivilegeService],
})
export class NetworkMapModule {}
