import { ApiProperty } from '@nestjs/swagger';
import { Band } from '../../band/entities/band.entity';
import { Case } from '../../case/entities/case.entity';
import {
  IsArray,
  IsBoolean,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class Parameters {
  @ApiProperty()
  @IsString()
  ParameterName: string;

  @ApiProperty({ description: 'Can be a string or number' })
  ParameterValue: string | number;

  @ApiProperty()
  @IsString()
  ParameterType: string;
}

class ExitConditions {
  @ApiProperty()
  @IsString()
  subRuleRef: string;

  @ApiProperty()
  @IsBoolean()
  outcome: boolean;

  @ApiProperty()
  @IsString()
  reason: string;
}

export class Config {
  @ApiProperty({ type: [Parameters] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Parameters)
  parameters: Parameters[];

  @ApiProperty({ type: [ExitConditions] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExitConditions)
  exitConditions: ExitConditions[];

  @ApiProperty({ type: [Band] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Band)
  bands: Band[];

  @ApiProperty({ type: [Case] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Case)
  cases: Case[];
}

export class RuleConfig {
  @ApiProperty()
  @IsString()
  _key: string;

  @ApiProperty()
  @IsString()
  _id: string;

  @ApiProperty()
  @IsString()
  _rev: string;

  @ApiProperty()
  @IsString()
  cfg: string;

  @ApiProperty()
  @IsString()
  desc: string;

  @ApiProperty()
  @IsString()
  state: string;

  @ApiProperty()
  @IsString()
  createdAt: string;

  @ApiProperty()
  @IsString()
  updatedAt: string;

  @ApiProperty()
  @IsString()
  updatedBy: string;

  @ApiProperty()
  @IsString()
  approverId: string;

  @ApiProperty()
  @IsString()
  ownerId: string;

  @ApiProperty()
  @IsString()
  ruleId: string;

  @ApiProperty()
  @IsObject()
  @ValidateNested()
  @Type(() => Config)
  config: Config;
}
