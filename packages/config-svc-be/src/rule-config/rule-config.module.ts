import { Module } from '@nestjs/common';
import { RuleConfigService } from './rule-config.service';
import { RuleConfigController } from './rule-config.controller';
import { ArangoDatabaseService } from '../arango-database/arango-database.service';
import { PrivilegeService } from '../privilege/privilege.service';
import { RuleService } from '../rule/rule.service';

@Module({
  controllers: [RuleConfigController],
  providers: [
    RuleConfigService,
    ArangoDatabaseService,
    PrivilegeService,
    RuleService,
  ],
  exports: [RuleConfigService],
})
export class RuleConfigModule {}
