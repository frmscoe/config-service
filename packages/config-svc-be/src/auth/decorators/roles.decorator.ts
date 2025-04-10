// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
