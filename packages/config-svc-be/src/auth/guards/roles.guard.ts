// <!-- SPDX-License-Identifier: Apache-2.0 -->
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrivilegeService } from '../../privilege/privilege.service';
import { Request } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly privilegeService: PrivilegeService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPrivileges =
      this.reflector.get<string[]>('roles', context.getHandler()) || [];

    if (!requiredPrivileges.length) {
      return true; // No privileges required → allow access
    }

    const request: Request = context.switchToHttp().getRequest();
    const token = request.token;

    if (!token) {
      throw new ForbiddenException('Access token not found in request');
    }

    const { valid, result } = await this.privilegeService.validateTokenAndClaims(
      token,
      requiredPrivileges,
    );

    // if (!valid) {
    //   throw new ForbiddenException('Insufficient privileges');
    // }

    // Optionally attach result (validated privileges map) to request
    request.user = {
      ...request.user,
      validatedPrivileges: result,
    };

    return true;
  }
}
