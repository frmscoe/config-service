import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class Parameters {
  @ApiProperty({
    description: 'Name of the parameter',
    example: 'max_query_limit',
  })
  @IsString()
  ParameterName: string;

  @ApiProperty({
    description: 'Can be a string or number',
    example: 0.1,
  })
  ParameterValue: string | number;

  @ApiProperty({
    description: 'Type of the parameter',
    example: 'number',
  })
  @IsString()
  ParameterType: string;
}

export class ExitConditions {
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

export class Band {
  @ApiProperty({
    description:
      'Reference to a sub-rule, typically an identifier used internally within the rule logic',
    example: '.01',
  })
  @IsString()
  subRuleRef: string;

  @ApiProperty({
    description: 'Upper limit for the band',
    example: 2,
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  upperLimit?: number;

  @ApiProperty({
    description: 'Lower limit for the band',
    example: 1,
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  lowerLimit?: number;

  @ApiProperty({
    description: 'Outcome when conditions within this band are met',
    example: false,
  })
  @IsBoolean()
  outcome: boolean;

  @ApiProperty({
    description: 'Reasoning or explanation for the outcome',
    example:
      'No similar amounts detected in the most recent transactions from the debtor',
  })
  @IsString()
  reason: string;
}

export class Case {
  @ApiProperty({
    description:
      'Reference to a sub-rule, typically an identifier used internally within the rule logic',
    example: '.00',
  })
  @IsString()
  subRuleRef: string;

  @ApiProperty({
    description: 'Explicit value to check against',
    example: 'WITHDRAWAL',
  })
  @IsString()
  value: string;

  @ApiProperty({
    description: 'Outcome when this case condition is met',
    example: true,
  })
  @IsBoolean()
  outcome: boolean;

  @ApiProperty({
    description: 'Reasoning or explanation for the outcome',
    example: 'The transaction is identified as a cash withdrawal',
  })
  @IsString()
  reason: string;
}

export class Config {
  @ApiProperty({
    description: 'Parameters associated with the config.',
    type: [Parameters],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Parameters)
  parameters: Parameters[];

  @ApiProperty({
    description: 'Exit conditions associated with the config.',
    type: [ExitConditions],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExitConditions)
  exitConditions: ExitConditions[];

  @ApiProperty({
    description: 'Bands associated with the config.',
    type: [Band],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Band)
  bands: Band[];

  @ApiProperty({
    description: 'Cases associated with the config.',
    type: [Case],
  })
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
