// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { NetworkMapStateEnum } from '../enums/network-map-state.enum'; // Adjusted path for backend

export class TransitionNetworkMapDto {
  @IsEnum(NetworkMapStateEnum, { message: `state must be one of the following values: ${Object.values(NetworkMapStateEnum).join(', ')}` })
  @IsNotEmpty()
  @ApiProperty({ enum: NetworkMapStateEnum, description: 'The target state for the network map' })
  state: NetworkMapStateEnum;
}
