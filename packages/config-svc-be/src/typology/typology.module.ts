// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { Module } from '@nestjs/common';
import { TypologyService } from './typology.service';
import { TypologyController } from './typology.controller';
import { ArangoDatabaseService } from '../arango-database/arango-database.service';
import { PrivilegeService } from '../privilege/privilege.service';
import { AuthModule } from '../auth/auth.module';
import { UserMappingModule } from '../user-mapping/user-mapping.module'; 

@Module({
  imports: [
    AuthModule,
    UserMappingModule, 
  ],
  controllers: [TypologyController],
  providers: [TypologyService, ArangoDatabaseService, PrivilegeService],
})
export class TypologyModule {}