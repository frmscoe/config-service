import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsObject,
  IsOptional,
  IsString,
  ValidateIf,
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
  @ValidateIf((o) => o.value !== undefined)
  @Type(() => Object)
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
    example: '2',
    type: 'number or string',
    required: false,
  })
  @IsOptional()
  @ValidateIf((o) => o.value !== undefined)
  @Type(() => Object)
  upperLimit?: string | number;

  @ApiProperty({
    description: 'Lower limit for the band',
    example: '1',
    type: 'number or string',
    required: false,
  })
  @IsOptional()
  @ValidateIf((o) => o.value !== undefined)
  @Type(() => Object)
  lowerLimit?: string | number;

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
    type: 'string or number',
  })
  @ValidateIf((o) => o.value !== undefined)
  @Type(() => Object)
  value: string | number;

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
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Parameters)
  parameters?: Parameters[];

  @ApiProperty({
    description: 'Exit conditions associated with the config.',
    type: [ExitConditions],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExitConditions)
  exitConditions?: ExitConditions[];

  @ApiProperty({
    description: 'Bands associated with the config.',
    type: [Band],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Band)
  bands?: Band[];

  @ApiProperty({
    description: 'Cases associated with the config.',
    type: [Case],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Case)
  cases?: Case[];
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
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => Config)
  config?: Config;
}
