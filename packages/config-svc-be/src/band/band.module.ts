import { Module } from '@nestjs/common';
import { BandService } from './band.service';
import { BandController } from './band.controller';

@Module({
  controllers: [BandController],
  providers: [BandService],
})
export class BandModule {}
