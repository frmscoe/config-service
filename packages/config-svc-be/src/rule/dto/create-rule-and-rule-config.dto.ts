// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { IsEnum, IsOptional, IsString, IsObject, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DataTypeEnum, SourceEnum } from '../schema/rule.schema';
import { Type } from 'class-transformer';
import { Config } from '../../rule-config/entities/rule-config.entity';

export class CreateRuleAndRuleConfigDto {
  @ApiProperty({
    example: '1.0.0',
    description: 'Configuration version of the rule',
  })
  @IsString()
  readonly rule_cfg: string;

  @ApiProperty({
    example: 'rule-001',
    description: 'Name of the rule',
  })
  @IsString()
  readonly name: string;

  @ApiProperty({
    example: DataTypeEnum.NUMERIC,
    enum: DataTypeEnum,
    description: 'Type of data the rule deals with',
  })
  @IsEnum(DataTypeEnum)
  readonly dataType: DataTypeEnum;

  @ApiProperty({
    example: 'Checks transaction amounts for anomalies',
    description: 'Description of what the rule checks for',
  })
  @IsString()
  readonly rule_desc: string;

  @ApiProperty({
    example: SourceEnum.USER_CREATED,
    enum: SourceEnum,
    description: 'Source of the rule creation',
    required: false,
  })
  @IsOptional()
  @IsEnum(SourceEnum)
  readonly source?: SourceEnum;

  @ApiProperty({
    description: 'Semantic version of the configuration.',
    example: '1.0.0',
  })
  @IsString()
  readonly rule_config_cfg: string;

  @ApiProperty({
    description: 'Description of the rule configuration.',
    example: 'Outgoing transfer similarity - amounts',
  })
  @IsString()
  readonly rule_config_desc: string;

  @ApiProperty({
    description:
      'Configuration details including parameters, exit conditions, bands, or cases.',
    type: () => Config,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => Config)
  config: Config;
}