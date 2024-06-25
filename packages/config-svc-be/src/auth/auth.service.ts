import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { AUTH_N_SVC_BASEURL, AUTHORIZATION_BASEURL } from '../constants';
import { Request } from 'express';
import { LoginResponseDto } from './dto/login-response.dto';
import { AuthDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor() {}
  async login(createAuthDto: CreateAuthDto): Promise<LoginResponseDto> {
    try {
      const response = await fetch(`${AUTH_N_SVC_BASEURL}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...createAuthDto }),
      });
      return await response.json();
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async userProfile(req: Request): Promise<AuthDto> {
    const user = req['user'];
    const response = await fetch(`${AUTHORIZATION_BASEURL}/platformRoles`, {
      method: 'GET',
      headers: { Authorization: req.headers.authorization },
    });

    if (!response.ok) {
      throw new BadRequestException('Failed to fetch platform roles');
    }

    const privileges = await response.json();

    if (!privileges) {
      throw new Error(`There are no privileges for the ${user.username}`);
    }

    const permissions = privileges
      .filter((privilege: { id: any }) =>
        user.platformRoleIds.includes(privilege.id),
      )
      .flatMap((privilege: { privileges: any }) => privilege.privileges);

    return { ...user, privileges: permissions };
  }
}
