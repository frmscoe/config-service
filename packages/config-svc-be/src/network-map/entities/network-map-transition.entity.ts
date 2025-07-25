// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional } from 'class-validator';
import { StateEnum } from '../../rule/schema/rule.schema';

export class NetworkMapTransition {
  @ApiProperty({ example: 'network_map/sample-uuid-1' })
  @IsString()
  _key: string;

  @ApiProperty({ enum: StateEnum, example: StateEnum['01_DRAFT'] })
  @IsEnum(StateEnum)
  state: StateEnum;

  @ApiProperty({ example: 'user@example.com' })
  @IsString()
  ownerId: string;

  @ApiProperty({ example: '2025-07-18T08:30:00.000Z' })
  @IsString()
  @IsOptional()
  updatedAt?: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsString()
  @IsOptional()
  modifiedBy?: string;

  @ApiProperty({ example: true })
  @IsOptional()
  edited?: boolean;
}
