// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { Module } from '@nestjs/common';
import { RuleService } from './rule.service';
import { RuleController } from './rule.controller';
import { ArangoDatabaseService } from '../arango-database/arango-database.service';
import { PrivilegeService } from '../privilege/privilege.service';
import { AuthModule } from '../auth/auth.module';
import { UserMappingModule } from '../user-mapping/user-mapping.module'; 

@Module({
  imports: [
    AuthModule,
    UserMappingModule, 
  ],
  controllers: [RuleController],
  providers: [RuleService, ArangoDatabaseService, PrivilegeService],
  exports: [RuleService],
})
export class RuleModule {}