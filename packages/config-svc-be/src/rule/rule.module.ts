import { Module } from '@nestjs/common';
import { RuleService } from './rule.service';
import { RuleController } from './rule.controller';
import { ArangoDatabaseService } from '../arango-database/arango-database.service';
import { PrivilegeService } from '../privilege/privilege.service';

@Module({
  controllers: [RuleController],
  providers: [RuleService, ArangoDatabaseService, PrivilegeService],
  exports: [RuleService],
})
export class RuleModule {}
