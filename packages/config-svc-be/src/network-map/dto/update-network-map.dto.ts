import { PartialType } from '@nestjs/swagger';
import { CreateNetworkMapDto } from './create-network-map.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNetworkMapDto extends PartialType(CreateNetworkMapDto) {
  @IsBoolean()
  @IsOptional()
  edited?: boolean;
}
