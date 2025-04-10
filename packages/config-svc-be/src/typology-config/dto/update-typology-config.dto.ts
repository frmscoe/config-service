// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { PartialType } from '@nestjs/mapped-types';
import { CreateTypologyConfigDto } from './create-typology-config.dto';

export class UpdateTypologyConfigDto extends PartialType(
  CreateTypologyConfigDto,
) {}
