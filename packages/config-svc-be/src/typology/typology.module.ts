import { Module } from '@nestjs/common';
import { TypologyService } from './typology.service';
import { TypologyController } from './typology.controller';
import { ArangoDatabaseService } from '../arango-database/arango-database.service';
import { PrivilegeService } from '../privilege/privilege.service';

@Module({
  controllers: [TypologyController],
  providers: [TypologyService, ArangoDatabaseService, PrivilegeService],
})
export class TypologyModule {}
