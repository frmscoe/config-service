import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { StateEnum } from '../../rule/schema/rule.schema';

class RuleConfigSummary {
  @ApiProperty({
    description: 'Database identifier for the rule configuration.',
    example: 'rule_config/sample-uuid-4',
  })
  @IsString()
  _id: string;

  @ApiProperty({
    description: 'Key within the database for the rule configuration.',
    example: 'sample-uuid-4',
  })
  @IsString()
  _key: string;

  @ApiProperty({
    description: 'Version of the rule configuration.',
    example: '1.0.0',
  })
  @IsString()
  cfg: string;
}

class RuleSummary {
  @ApiProperty({
    description: 'Database identifier for the rule.',
    example: 'rule/sample-uuid-3',
  })
  @IsString()
  _id: string;

  @ApiProperty({
    description: 'Key within the database for the rule.',
    example: 'sample-uuid-3',
  })
  @IsString()
  _key: string;

  @ApiProperty({ description: 'Name of the rule.', example: 'Rule 3' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Version of the rule.', example: '1.0.0' })
  @IsString()
  cfg: string;
}

class RuleWithConfigs {
  @ApiProperty({ description: 'Details of the rule', type: RuleSummary })
  @ValidateNested()
  @Type(() => RuleSummary)
  rule: RuleSummary;

  @ApiProperty({
    description: 'Configurations associated with the rule.',
    type: [RuleConfigSummary],
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => RuleConfigSummary)
  ruleConfigs?: RuleConfigSummary[];
}

class Typology {
  @ApiProperty({
    description: 'Typology Processor ID with version.',
    example: 'Typology Processor 1@1.0.0',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Name of the typology processor.',
    example: 'Typology Processor 1',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Version of the configuration.',
    example: '1.0.0',
  })
  @IsString()
  cfg: string;

  @ApiProperty({
    description: 'Indicates if the typology processor is active.',
    default: false,
  })
  @IsBoolean()
  active: boolean;

  @ApiProperty({
    description: 'Array of rules with their respective configurations.',
    type: [RuleWithConfigs],
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => RuleWithConfigs)
  rulesWithConfigs?: RuleWithConfigs[];
}

class Event {
  @ApiProperty({
    description: 'Event ID from the events collection.',
    example: 'event/sample-uuid-22',
  })
  @IsString()
  eventId: string;

  @ApiProperty({
    description: 'Array of typologies associated with the event.',
    type: [Typology],
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => Typology)
  typologies?: Typology[];
}

export class NetworkMap {
  @ApiProperty()
  @IsString()
  _key: string;

  @ApiProperty({
    description: 'Flag to indicate if the network map is active.',
    default: false,
  })
  @IsBoolean()
  active: boolean;

  @ApiProperty({
    description: 'A x.y.z versioning for the network map',
    example: '1.0.0',
  })
  @IsString()
  cfg: string;

  @ApiProperty({
    description: 'State of the network map.',
    example: '01_DRAFT',
  })
  @IsEnum(StateEnum)
  state: StateEnum;

  @ApiProperty({
    description: 'Array of events associated with the network map.',
    type: [Event],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Event)
  events: Event[];

  @ApiProperty()
  @IsString()
  createdAt?: string;

  @ApiProperty()
  @IsString()
  updatedAt?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  updatedBy?: string;

  @ApiProperty({
    description: 'Identifier for the owner of the network map.',
    example: 'user@example.com',
  })
  @IsString()
  ownerId: string;

  @ApiProperty({
    description: 'Identifier for the approver of the network map.',
    example: 'user@example.com',
  })
  @IsString()
  @IsOptional()
  approverId?: string;

  @ApiProperty({
    description: 'Identifier for the network map that originated this one.',
    example: 'network_map/sample-uuid-3',
  })
  @IsOptional()
  @IsString()
  originatedId?: string | null;

  @ApiProperty({
    description: 'Flag to indicate if the network map has been edited.',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  edited?: boolean;

  @ApiProperty({
    description: 'Identifier for the existing imported network maps.',
  })
  @IsNumber()
  @IsOptional()
  referenceId?: number | null;

  @ApiProperty({
    description: 'Source of the network map.',
    example: 'user_created',
  })
  @IsString()
  @IsOptional()
  source?: string;
}
