import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrivilegeService } from '../../privilege/privilege.service';

const ADMIN_PRIVILEGE = 'SECURITY_BOOTSTRAP_PRIVILEGES';
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly privilegeService: PrivilegeService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const role = this.reflector.get<string[]>('roles', context.getHandler());
    const request = context.switchToHttp().getRequest();

    try {
      const authorizationClient =
        await this.privilegeService.privilegeConnection();
      await authorizationClient.fetch();
      return (
        authorizationClient.rolesHavePrivilege(
          request['user'].platformRoleIds,
          role[0],
        ) ||
        authorizationClient.rolesHavePrivilege(
          request['user'].platformRoleIds,
          ADMIN_PRIVILEGE,
        )
      );
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
}
