import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DataTypeEnum, SourceEnum } from '../schema/rule.schema';

export class CreateRuleDto {
  @ApiProperty({
    example: '1.0.0',
    description: 'Configuration version of the rule',
  })
  @IsString()
  readonly cfg: string;

  @ApiProperty({
    example: 'rule-001',
    description: 'Name of the rule',
  })
  @IsString()
  readonly name: string;

  @ApiProperty({
    example: DataTypeEnum.NUMERIC,
    enum: DataTypeEnum,
    description: 'Type of data the rule deals with',
    required: false,
  })
  @IsOptional()
  @IsEnum(DataTypeEnum)
  readonly dataType: DataTypeEnum;

  @ApiProperty({
    example: 'Checks transaction amounts for anomalies',
    description: 'Description of what the rule checks for',
  })
  @IsString()
  readonly desc: string;

  @ApiProperty({
    example: SourceEnum.USER_CREATED,
    enum: SourceEnum,
    description: 'Source of the rule creation',
    required: false,
  })
  @IsOptional()
  @IsEnum(SourceEnum)
  readonly source?: SourceEnum;
}
