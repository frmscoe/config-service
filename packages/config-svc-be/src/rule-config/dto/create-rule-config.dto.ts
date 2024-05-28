import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Config } from '../entities/rule-config.entity';

export class CreateRuleConfigDto {
  @ApiProperty({
    description: 'Semantic version of the configuration.',
    example: '1.0.0',
  })
  @IsString()
  readonly cfg: string;

  @ApiProperty({
    description: 'Description of the rule configuration.',
    example: 'Outgoing transfer similarity - amounts',
  })
  @IsString()
  readonly desc: string;

  @ApiProperty({
    description: 'Identifier of the rule that this configuration applies to.',
    example: 'rule/sample-uuid-3',
  })
  @IsString()
  readonly ruleId: string;

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
