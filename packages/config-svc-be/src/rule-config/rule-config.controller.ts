// <!-- SPDX-License-Identifier: Apache-2.0 -->
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  Request,
} from '@nestjs/common';
import { RuleConfigService } from './rule-config.service';
import { CreateRuleConfigDto } from './dto/create-rule-config.dto';
import { UpdateRuleConfigDto } from './dto/update-rule-config.dto';
import { TransitionRuleConfigDto } from './dto/transition-rule-config.dto'; // NEW IMPORT
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiExcludeEndpoint,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RuleConfigPrivilege } from './privilege.constant';
import { RuleConfig } from './entities/rule-config.entity';

@ApiTags('Rule Config')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('rule-config')
export class RuleConfigController {
  constructor(private readonly ruleConfigService: RuleConfigService) {}

  @Post()
  @Roles(RuleConfigPrivilege.CREATE_RULE_CONFIG)
  @ApiOperation({ summary: 'Create a new rule configuration' })
  @ApiCreatedResponse({
    description: 'The rule configuration has been successfully created.',
    type: RuleConfig,
  })
  create(@Body() createRuleConfigDto: CreateRuleConfigDto, @Request() req) {
    return this.ruleConfigService.create(createRuleConfigDto, req);
  }

  @Get()
  @Roles(RuleConfigPrivilege.GET_RULE_CONFIGS)
  @ApiOperation({ summary: 'Retrieve all rule configurations' })
  @ApiOkResponse({
    description: 'All rule configurations have been successfully retrieved.',
    type: [RuleConfig],
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.ruleConfigService.findAll(page, limit);
  }

  @Get(':id')
  @Roles(RuleConfigPrivilege.GET_RULE_CONFIG)
  @ApiOperation({ summary: 'Retrieve a rule configuration by ID' })
  @ApiOkResponse({
    description: 'The rule configuration has been successfully retrieved.',
    type: RuleConfig,
  })
  findOne(@Param('id') id: string) {
    return this.ruleConfigService.findOne(id);
  }

  // // This endpoint remains for general content updates (and for creating new versions)
  // @Patch(':id')
  // @Roles(RuleConfigPrivilege.UPDATE_RULE_CONFIG)
  // @ApiOperation({ summary: 'Update a rule configuration (creates new version if applicable)' })
  // @ApiOkResponse({
  //   description: 'The rule configuration has been successfully updated or a new version created.',
  //   type: RuleConfig,
  // })
  // update(
  //   @Param('id') id: string,
  //   @Body() updateRuleConfigDto: UpdateRuleConfigDto,
  //   @Request() req,
  // ) {
  //   // This still calls duplicateRuleConfig based on your existing service logic
  //   return this.ruleConfigService.duplicateRuleConfig(
  //     id,
  //     updateRuleConfigDto,
  //     req,
  //   );
  // }

  @Patch(':id')
  @Roles(RuleConfigPrivilege.UPDATE_RULE_CONFIG)
  @ApiOperation({ summary: 'Update an existing rule configuration' })
  @ApiOkResponse({
    description: 'The rule configuration has been successfully updated.',
    type: RuleConfig,
  })
  update(
    @Param('id') id: string,
    @Body() updateRuleConfigDto: UpdateRuleConfigDto,
    @Request() req,
  ) {
    return this.ruleConfigService.update(id, updateRuleConfigDto);
  }



  // NEW ENDPOINT FOR STATE TRANSITIONS
  @Patch(':id/transition') // Dedicated endpoint for state transitions
  // The RolesGuard will check for UPDATE_RULE_CONFIG privilege
  @Roles(RuleConfigPrivilege.UPDATE_RULE_CONFIG)
  @ApiOperation({ summary: 'Transition the state of a rule configuration' })
  @ApiOkResponse({
    description: 'The rule configuration state has been successfully transitioned.',
    type: RuleConfig,
  })
  transition(
    @Param('id') id: string,
    @Body() transitionRuleConfigDto: TransitionRuleConfigDto, // Use the new DTO
    @Request() req,
  ) {
    return this.ruleConfigService.transitionRuleConfigState( // New service method
      id,
      transitionRuleConfigDto.state,
      req,
    );
  }

  @ApiExcludeEndpoint()
  @Delete(':id')
  @Roles(RuleConfigPrivilege.DELETE_RULE_CONFIG)
  @ApiOperation({ summary: 'Delete a rule configuration' })
  @ApiNoContentResponse({
    description: 'The rule configuration has been successfully deleted.',
    type: RuleConfig,
  })
  remove(@Param('id') id: string, @Request() req) {
    return this.ruleConfigService.remove(id, req);
  }

  @ApiExcludeEndpoint()
  @Patch(':id/disable')
  @Roles(RuleConfigPrivilege.DISABLE_RULE_CONFIG)
  @ApiOperation({ summary: 'Disable a rule configuration' })
  @ApiOkResponse({
    description: 'The rule configuration has been successfully disabled.',
    type: RuleConfig,
  })
  disable(@Param('id') id: string, @Request() req) {
    return this.ruleConfigService.disableRuleConfig(id, req);
  }
}