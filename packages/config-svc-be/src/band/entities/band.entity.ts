import { ApiProperty } from '@nestjs/swagger';

export class Band {
  @ApiProperty()
  subRuleRef: string;

  @ApiProperty()
  upperLimit: number;

  @ApiProperty()
  outcome: boolean;

  @ApiProperty()
  reason: string;
}
