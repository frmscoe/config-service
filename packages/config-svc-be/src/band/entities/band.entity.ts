import { ApiProperty } from '@nestjs/swagger';

export class Band {
  @ApiProperty()
  subRuleRef: string;

  @ApiProperty()
  upperLimit: number;

  @ApiProperty()
  reason: string;
}
