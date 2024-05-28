import { Module } from '@nestjs/common';
import { TypologyService } from './typology.service';
import { TypologyController } from './typology.controller';

@Module({
  controllers: [TypologyController],
  providers: [TypologyService],
})
export class TypologyModule {}
