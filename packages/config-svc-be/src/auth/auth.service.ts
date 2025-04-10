// <!-- SPDX-License-Identifier: Apache-2.0 -->
import { BadRequestException, Injectable } from '@nestjs/common';
import axios from 'axios';
import { Request } from 'express';

import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { AuthDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor() {}

  async login(createAuthDto: CreateAuthDto): Promise<LoginResponseDto> {
    try {
      const response = await axios.post(
        'http://localhost:3020/v1/auth/login',
        {
          username: createAuthDto.username,
          password: createAuthDto.password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          maxBodyLength: Infinity,
        },
      );

      return response.data;
    } catch (error) {
      throw new BadRequestException(
        error?.response?.data?.message || 'Authentication failed',
      );
    }
  }

  async userProfile(req: Request): Promise<AuthDto> {
    const user = req['user'];

    if (!user) {
      throw new BadRequestException('User information not found in request');
    }

    return {
      ...user,
      privileges: user.roles || user.privileges || [], // Adjust this line based on your token structure
    };
  }
}
