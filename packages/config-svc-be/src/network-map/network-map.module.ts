// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { Module } from '@nestjs/common';
import { NetworkMapController } from './network-map.controller';
import { NetworkMapService } from './network-map.service';
import { ArangoDatabaseService } from '../arango-database/arango-database.service';
import { PrivilegeService } from '../privilege/privilege.service';
import { AuthModule } from '../auth/auth.module';
import { UserMappingModule } from '../user-mapping/user-mapping.module'; 

@Module({
  imports: [
    AuthModule,
    UserMappingModule, 
  ],
  controllers: [NetworkMapController],
  providers: [NetworkMapService, ArangoDatabaseService, PrivilegeService],
})
export class NetworkMapModule {}