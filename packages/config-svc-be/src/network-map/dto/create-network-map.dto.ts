import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class RuleConfigSummaryDto {
  @ApiProperty({
    description: 'Database identifier for the rule configuration.',
    example: 'rule_config/sample-uuid-4',
  })
  @IsString()
  readonly _id: string;

  @ApiProperty({
    description: 'Key within the database for the rule configuration.',
    example: 'sample-uuid-4',
  })
  @IsString()
  readonly _key: string;

  @ApiProperty({
    description: 'Version of the rule configuration.',
    example: '1.0.0',
  })
  @IsString()
  readonly cfg: string;
}

class RuleSummaryDto {
  @ApiProperty({
    description: 'Database identifier for the rule.',
    example: 'rule/sample-uuid-3',
  })
  @IsString()
  readonly _id: string;

  @ApiProperty({
    description: 'Key within the database for the rule.',
    example: 'sample-uuid-3',
  })
  @IsString()
  readonly _key: string;

  @ApiProperty({ description: 'Name of the rule.', example: 'Rule 3' })
  @IsString()
  readonly name: string;

  @ApiProperty({ description: 'Version of the rule.', example: '1.0.0' })
  @IsString()
  readonly cfg: string;
}

class RulesWithConfigsDto {
  @ApiProperty({
    description: 'Details of the rule',
    type: RuleSummaryDto,
  })
  @ValidateNested()
  @Type(() => RuleSummaryDto)
  readonly rule: RuleSummaryDto;

  @ApiProperty({
    description: 'Configurations associated with the rule.',
    type: [RuleConfigSummaryDto],
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => RuleConfigSummaryDto)
  readonly ruleConfigs?: RuleConfigSummaryDto[];
}

class TypologyDto {
  @ApiProperty({
    description: 'Typology Processor ID with version.',
    example: 'Typology Processor 1@1.0.0',
  })
  @IsString()
  readonly id: string;

  @ApiProperty({
    description: 'Name of the typology processor.',
    example: 'Typology Processor 1',
  })
  @IsString()
  readonly name: string;

  @ApiProperty({
    description: 'Version of the configuration.',
    example: '1.0.0',
  })
  @IsString()
  readonly cfg: string;

  @ApiProperty({
    description: 'Indicates if the typology processor is active.',
    default: false,
  })
  @IsBoolean()
  readonly active: boolean;

  @ApiProperty({
    description: 'Array of rules with their respective configurations.',
    type: [RulesWithConfigsDto],
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => RulesWithConfigsDto)
  readonly rulesWithConfigs?: RulesWithConfigsDto[];
}

class CreateEventDto {
  @ApiProperty({
    description: 'Event ID from the events collection.',
    example: 'event/sample-uuid-22',
  })
  @IsString()
  readonly eventId: string;

  @ApiProperty({
    description: 'Array of typologies associated with the event.',
    type: [TypologyDto],
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TypologyDto)
  readonly typologies?: TypologyDto[];
}

export class CreateNetworkMapDto {
  @ApiProperty({
    description: 'Flag to indicate if the network map is active.',
    default: false,
  })
  @IsBoolean()
  readonly active: boolean;

  @ApiProperty({
    description: 'A x.y.z versioning for the network map',
    example: '1.0.0',
  })
  @IsString()
  readonly cfg: string;

  @ApiProperty({
    description: 'Array of events associated with the network map.',
    type: [CreateEventDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEventDto)
  readonly events: CreateEventDto[];

  @ApiProperty({
    description: 'Source of the network map.',
    example: 'user_created',
  })
  @IsString()
  @IsOptional()
  readonly source?: string;
}
