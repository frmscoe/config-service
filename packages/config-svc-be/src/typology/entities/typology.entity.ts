import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Config } from '../../rule-config/entities/rule-config.entity';

class RulesRuleConfigs {
  @ApiProperty({
    description: 'Identifier of the rule document from the rule collection.',
    example: 'rule/sample-uuid-3',
  })
  @IsString()
  @IsOptional()
  ruleId?: string;

  @ApiProperty({
    description:
      'Array of identifiers for rule config documents from the rule config collection.',
    example: ['rule_config/sample-uuid-4', 'rule_config/sample-uuid-5'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  ruleConfigId?: string[];
}

export class Typology {
  @ApiProperty()
  @IsString()
  _key: string;

  @ApiProperty()
  @IsString()
  name: string;

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
  createdAt?: string;

  @ApiProperty()
  @IsString()
  updatedAt?: string;

  @ApiProperty({
    description:
      'Array of typology category identifiers that the typology belongs to.',
    example: [
      'typology_category/sample-uuid-7',
      'typology_category/sample-uuid-10',
    ],
  })
  @IsArray()
  @IsString({ each: true })
  typologyCategoryUUID: string[];

  @ApiProperty({
    description:
      'An array of objects linking this typology to specific rules and their configurations. Each object contains a ruleId and an array of associated ruleConfigIds.',
    type: [RulesRuleConfigs],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @IsOptional()
  @Type(() => RulesRuleConfigs)
  rules_rule_configs: RulesRuleConfigs[];

  @ApiProperty()
  @IsString()
  @IsOptional()
  updatedBy?: string;

  @ApiProperty()
  @IsString()
  ownerId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  approverId?: string;

  @ApiProperty({
    description:
      'The identifier for the existing imported typologies. The Typology processor ID in the source system.',
  })
  @IsNumber()
  @IsOptional()
  referenceId?: number | null;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsOptional()
  originatedId?: string | null;

  @ApiProperty({
    description: 'Flag to indicate if the typology has been edited.',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  edited?: boolean;
}
class RuleConfigsSummary {
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

  @ApiProperty({
    description: 'Identifier of the rule document from the rule collection.',
    example: 'rule/sample-uuid-3',
  })
  @IsString()
  ruleId: string;

  @ApiProperty({
    description: 'Config details',
    type: Config,
  })
  @ValidateNested()
  @Type(() => Config)
  config: Config;
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
    type: [RuleConfigsSummary],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RuleConfigsSummary)
  ruleConfigs: RuleConfigsSummary[];
}
export class TypologyRuleWithConfigs extends Typology {
  @ApiProperty({
    description: 'An array of rules with their respective configurations.',
    type: [RuleWithConfigs],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RuleWithConfigs)
  ruleWithConfigs: RuleWithConfigs[];
}
