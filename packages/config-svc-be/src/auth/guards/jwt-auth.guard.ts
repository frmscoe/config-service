// <!-- SPDX-License-Identifier: Apache-2.0 -->
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Missing token');
    }

    try {
      const decoded: any = jwt.decode(token);

      if (!decoded || typeof decoded !== 'object') {
        throw new UnauthorizedException('Invalid token');
      }

      request['token'] = token;

      request['user'] = {
        clientId: decoded.clientId ?? null,
        username: decoded.username ?? '', // Optional fallback
        platformRoleIds: [],
        privileges: decoded.claims || [],
      };

      return true;
    } catch (err) {
      throw new UnauthorizedException('Failed to decode token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
