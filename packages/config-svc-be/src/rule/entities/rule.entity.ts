import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsString,
  IsOptional,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { DataTypeEnum, StateEnum, SourceEnum } from '../schema/rule.schema';
import { RuleConfig } from '../../rule-config/entities/rule-config.entity';
import { Type } from 'class-transformer';

export class Rule {
  @ApiProperty({ example: '123' })
  @IsString()
  _key: string;

  @ApiProperty({ example: 'rule/123' })
  @IsString()
  _id: string;

  @ApiProperty({ example: 'some-revision' })
  @IsString()
  _rev: string;

  @ApiProperty({ example: '1.0.0', description: 'Configuration version' })
  @IsString()
  cfg: string;

  @ApiProperty({
    enum: DataTypeEnum,
    description: 'Type of data the rule deals with',
  })
  @IsEnum(DataTypeEnum)
  dataType?: DataTypeEnum;

  @ApiProperty({ example: 'rule-001' })
  @IsString()
  name: string;

  @ApiProperty({ enum: StateEnum, description: 'Current state of the rule' })
  @IsEnum(StateEnum)
  state: StateEnum;

  @ApiProperty({ example: 'Checks transaction amounts for anomalies' })
  @IsString()
  desc: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsString()
  ownerId: string;

  @ApiProperty({ type: Date })
  @IsDate()
  createdAt: Date;

  @ApiProperty({ type: Date })
  @IsDate()
  updatedAt: Date;

  @ApiProperty({ example: 'user@example.com' })
  @IsString()
  updatedBy: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsString()
  approverId: string;

  @ApiProperty({ example: 'sample-uuid', required: false })
  @IsOptional()
  @IsString()
  originatedID?: string;

  @ApiProperty({
    example: 'false',
    description: 'Whether the rule has been edited',
  })
  @IsBoolean()
  edited: boolean;

  @ApiProperty({ enum: SourceEnum, description: 'Where the rule come from' })
  @IsEnum(SourceEnum)
  source: SourceEnum;
}

export class RuleWithConfig extends Rule {
  @ApiProperty({ type: () => RuleConfig, isArray: true })
  @ValidateNested({ each: true })
  @Type(() => RuleConfig)
  ruleConfigs: RuleConfig[];
}

export class RuleWithConfigResponse {
  @ApiProperty()
  count: number;

  @ApiProperty({ type: () => RuleWithConfig, isArray: true })
  rules: RuleWithConfig[];
}
