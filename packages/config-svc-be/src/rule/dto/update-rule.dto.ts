import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateRuleDto } from './create-rule.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { DataTypeEnum, SourceEnum } from '../schema/rule.schema';

export class UpdateRuleDto extends PartialType(CreateRuleDto) {
  @ApiProperty({
    example: '1.0.1',
    description: 'Configuration version of the rule',
    required: false,
  })
  @IsString()
  @IsOptional()
  cfg?: string;

  @ApiProperty({
    example: 'rule-002',
    description: 'Name of the rule',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: DataTypeEnum.NUMERIC,
    description: 'Type of data the rule deals with',
    required: false,
    enum: DataTypeEnum,
  })
  @IsEnum(DataTypeEnum)
  @IsOptional()
  dataType?: DataTypeEnum;

  @ApiProperty({
    example: 'Updates description for rule checks',
    description: 'Description of what the rule checks for',
    required: false,
  })
  @IsString()
  @IsOptional()
  desc?: string;

  @ApiProperty({
    example: SourceEnum.CALIBRATION_SERVICE,
    description: 'Source of the rule creation',
    required: false,
    enum: SourceEnum,
  })
  @IsOptional()
  @IsEnum(SourceEnum)
  source?: SourceEnum;
}
