// <!-- SPDX-License-Identifier: Apache-2.0 -->
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Headers,
  Request,
} from '@nestjs/common';
import { ExitConditionsService } from './exit-conditions.service';
import { CreateExitConditionDto } from './dto/create-exit-condition.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { ExitConditionDto } from './dto/exit-condition.dto';

@ApiTags('Exit Conditions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('exit-conditions')
export class ExitConditionsController {
  constructor(private readonly exitConditionsService: ExitConditionsService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve all exit conditions' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all exit conditions.',
    type: [ExitConditionDto],
  })
  @ApiResponse({ status: 400, description: 'Invalid token or insufficient privileges.' })
  async findAll(@Headers('Authorization') authHeader: string): Promise<ExitConditionDto[]> {
    const token = authHeader.split(' ')[1];
    return this.exitConditionsService.findAll(token);
  }

  @Get('default/:ownerId')
  @ApiOperation({ summary: 'Retrieve the default exit condition for a user' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the default exit condition.',
    type: Object,
  })
  @ApiResponse({ status: 400, description: 'Invalid input or insufficient privileges.' })
  @ApiResponse({ status: 404, description: 'Default exit condition not found for this user.' })
  async getDefaultExitConditionForUser(
    @Param('ownerId') ownerId: string,
    @Headers('Authorization') authHeader: string,
  ) {
    const token = authHeader.split(' ')[1];
    return this.exitConditionsService.getDefaultExitConditionForUser(
      ownerId,
      token,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve an exit condition by ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved exit condition.',
    type: ExitConditionDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid ID or insufficient privileges.' })
  @ApiResponse({ status: 404, description: 'Exit condition not found.' })
  async findOne(
    @Param('id') id: string,
    @Headers('Authorization') authHeader: string,
  ): Promise<ExitConditionDto> {
    const token = authHeader.split(' ')[1];
    return this.exitConditionsService.findOne(id, token);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new exit condition' })
  @ApiResponse({
    status: 201,
    description: 'The exit condition has been successfully created.',
    type: ExitConditionDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input or insufficient privileges.' })
  async create(
    @Body() createExitConditionDto: CreateExitConditionDto,
    @Headers('Authorization') authHeader: string,
    @Request() req, // Added req parameter
  ): Promise<ExitConditionDto> {
    const token = authHeader.split(' ')[1];
    return this.exitConditionsService.create(createExitConditionDto, token, req); // Passed req
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an exit condition' })
  @ApiResponse({
    status: 200,
    description: 'The exit condition has been successfully updated.',
    type: ExitConditionDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input or insufficient privileges.' }) // Removed trailing backslash
  @ApiResponse({ status: 404, description: 'Exit condition not found.' }) // Removed trailing backslash
  async update(
    @Param('id') id: string,
    @Body() updateExitConditionDto: CreateExitConditionDto,
    @Headers('Authorization') authHeader: string,
    @Request() req, // Added req parameter
  ): Promise<ExitConditionDto> {
    const token = authHeader.split(' ')[1];
    return this.exitConditionsService.update(id, updateExitConditionDto, token, req); // Passed req
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an exit condition' })
  @ApiResponse({
    status: 204,
    description: 'The exit condition has been successfully deleted.',
  })
  @ApiResponse({ status: 400, description: 'Insufficient privileges or cannot delete System Default condition/condition in use.' })
  @ApiResponse({ status: 404, description: 'Exit condition not found.' })
  async remove(
    @Param('id') id: string,
    @Headers('Authorization') authHeader: string,
  ): Promise<void> {
    const token = authHeader.split(' ')[1];
    await this.exitConditionsService.remove(id, token);
  }

  @Post('set-default/:ownerId/:exitConditionId')
  @ApiOperation({ summary: 'Set a default exit condition for a user' })
  @ApiResponse({
    status: 201,
    description: 'The default exit condition for the user has been successfully set.',
    type: Object,
  })
  @ApiResponse({ status: 400, description: 'Invalid input or insufficient privileges.' })
  @ApiResponse({ status: 404, description: 'Exit condition not found.' })
  async setDefaultExitConditionForUser(
    @Param('ownerId') ownerId: string,
    @Param('exitConditionId') exitConditionId: string,
    @Headers('Authorization') authHeader: string,
  ) {
    const token = authHeader.split(' ')[1];
    return this.exitConditionsService.setDefaultExitConditionForUser(
      ownerId,
      exitConditionId,
      token,
    );
  }
}