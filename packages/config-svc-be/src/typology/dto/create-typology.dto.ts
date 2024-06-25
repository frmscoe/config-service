import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class RulesRuleConfigsDto {
  @ApiProperty({
    description: 'Identifier of the rule document from the rule collection.',
    example: 'rule/sample-uuid-3',
  })
  @IsString()
  readonly ruleId: string;

  @ApiProperty({
    description:
      'Array of identifiers for rule config documents from the rule config collection.',
    example: ['rule_config/sample-uuid-4', 'rule_config/sample-uuid-5'],
  })
  @IsArray()
  @IsString({ each: true })
  readonly ruleConfigId: string[];
}

export class CreateTypologyDto {
  @ApiProperty({
    description: 'Name of the typology.',
    example: 'Identity theft I',
  })
  @IsString()
  readonly name: string;

  @ApiProperty({
    description: 'Semantic version of the typology.',
    example: '1.0.0',
  })
  @IsString()
  readonly cfg: string;

  @ApiProperty({
    description: 'Description of the typology.',
    example: 'Describes the details of the Identity theft I typology.',
  })
  @IsString()
  readonly desc: string;

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
  readonly typologyCategoryUUID: string[];

  @ApiProperty({
    description:
      'Array of objects linking this typology to specific rules and their configurations. Each object contains a ruleId and an array of associated ruleConfigIds.',
    type: [RulesRuleConfigsDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RulesRuleConfigsDto)
  readonly rules_rule_configs: RulesRuleConfigsDto[];

  @ApiProperty({
    description:
      'The identifier for the existing imported typologies. The Typology processor ID in the source system.',
    example: null,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  readonly referenceId?: number;
}
