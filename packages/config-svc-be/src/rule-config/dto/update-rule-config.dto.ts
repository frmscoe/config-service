import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsObject,
  ValidateNested,
  IsOptional, IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Config } from '../entities/rule-config.entity';
import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateRuleConfigDto } from './create-rule-config.dto';

export class UpdateRuleConfigDto extends PartialType(
  OmitType(CreateRuleConfigDto, ['ruleId'] as const),
) {
  @ApiProperty({
    description:
      'Semantic version of the configuration. Update if a new version is applied.',
    example: '1.0.1',
    required: false,
  })
  @IsString()
  @IsOptional()
  cfg?: string;

  @ApiProperty({
    description:
      'Description of the rule configuration. Update to reflect any changes or enhancements.',
    example: 'Updated outgoing transfer similarity - amounts',
    required: false,
  })
  @IsString()
  @IsOptional()
  desc?: string;

  @ApiProperty({
    description:
      'Configuration details including updated parameters, exit conditions, bands, or cases.',
    type: () => Config,
    required: false,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => Config)
  @IsOptional()
  config?: Config;

  @IsBoolean()
  @IsOptional()
  edited?: boolean;
}
