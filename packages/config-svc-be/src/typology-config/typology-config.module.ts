import { Module } from '@nestjs/common';
import { TypologyConfigService } from './typology-config.service';
import { TypologyConfigController } from './typology-config.controller';

@Module({
  controllers: [TypologyConfigController],
  providers: [TypologyConfigService],
})
export class TypologyConfigModule {}
