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
  Request,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { RuleService } from './rule.service';
import { CreateRuleDto } from './dto/create-rule.dto';
import { CreateRuleAndRuleConfigDto } from './dto/create-rule-and-rule-config.dto';
import { UpdateRuleDto } from './dto/update-rule.dto';
import { UpdateRuleStateDto } from './dto/update-rule-state.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import {
  Rule,
  RuleWithConfigResponse,
  RuleWithConfig,
} from './entities/rule.entity';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RulePrivileges } from './privilege.constant';

@ApiTags('Rule')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('rule')
export class RuleController {
  constructor(private readonly ruleService: RuleService) {}

  @Post()
  @Roles(RulePrivileges.CREATE_RULE)
  @ApiOperation({ summary: 'Create a new rule' })
  @ApiCreatedResponse({
    description: 'The rule has been successfully created.',
    type: Rule,
  })
  create(@Body() createRuleDto: CreateRuleDto, @Request() req) {
    return this.ruleService.create(createRuleDto, req);
  }

  
  @Get()
  @Roles(RulePrivileges.GET_RULES)
  @ApiOperation({ summary: 'Retrieve all rules with optional filters' })
  @ApiQuery({ name: 'page', type: 'number', required: false, example: 1 })
  @ApiQuery({ name: 'limit', type: 'number', required: false, example: 10 })
  @ApiQuery({ name: 'desc', type: 'string', required: false, description: 'Filter by description (partial match, case-insensitive)' })
  @ApiQuery({ name: 'name', type: 'string', required: false, description: 'Filter by rule name (partial match, case-insensitive)' })
  @ApiQuery({ name: 'cfg', type: 'string', required: false, description: 'Filter by config value (partial match, case-insensitive)' })
  @ApiQuery({ name: 'state', type: 'string', required: false, description: 'Filter by rule state (exact match)' })
  @ApiQuery({ name: 'ownerId', type: 'string', required: false, description: 'Filter by owner ID (exact match)' })
  @ApiOkResponse({
    description: 'List of rules',
    type: Rule,
    isArray: true,
  })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('desc') desc?: string,
    @Query('name') name?: string,
    @Query('cfg') cfg?: string,
    @Query('state') state?: string,
    @Query('ownerId') ownerId?: string,
  ) {
    return this.ruleService.findAll({
      page,
      limit,
      desc,
      name,
      cfg,
      state,
      ownerId,
    });
  }



  @Post('/import')
  @Roles(RulePrivileges.CREATE_RULE) // TODO: Update this to IMPORT_RULE when all privileges are implemented. 
  @ApiOperation({ summary: 'Import a rule config' })
  @ApiCreatedResponse({
    description: 'The rule config has been successfully imported.',
    type: Rule,
  })
  createRuleAndRuleConfig(@Body() createRuleAndRuleConfigDto: CreateRuleAndRuleConfigDto, @Request() req) {
   return this.ruleService.createRuleAndRuleConfig(createRuleAndRuleConfigDto, req);
  }

  @Get('/rule-config')
  @Roles(RulePrivileges.GET_RULE_RULE_CONFIG)
  @ApiOperation({ summary: 'Retrieve all rules and rule configs' })
  @ApiQuery({ name: 'page', type: 'number', required: false, example: 1 })
  @ApiQuery({ name: 'limit', type: 'number', required: false, example: 10 })
  @ApiOkResponse({
    description: 'List of rules and their configurations',
    type: RuleWithConfigResponse,
  })
  findRuleConfigs(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.ruleService.findRuleConfigs({ page, limit });
  }

  
  @Get('/rule-and-its-configs/:name')
  @Roles(RulePrivileges.GET_RULE_RULE_CONFIG)
  @ApiOperation({ summary: 'Retrieve a rule and its configurations by rule name' })
  @ApiParam({ name: 'name', type: 'string', required: true, description: 'The name of the rule to retrieve configurations for' })
  @ApiOkResponse({
    description: 'Rule and its configurations',
    type: RuleWithConfigResponse,
  })
  findRuleConfigsByName(
    @Param('name') name: string,
  ) {
    return this.ruleService.findRuleConfigsByName(name);
  }

  @Get(':id')
  @Roles(RulePrivileges.GET_RULE)
  @ApiOperation({ summary: 'Get a single rule by ID' })
  @ApiOkResponse({ description: 'Details of the rule', type: Rule })
  findOne(@Param('id') id: string) {
    return this.ruleService.findOne(id);
  }

  @Get('name/:name')
  @Roles(RulePrivileges.GET_RULE)
  @ApiOperation({ summary: 'Get a single rule by name' })
  @ApiOkResponse({ description: 'Details of the rule', type: Rule })
  async findOneByName(@Param('name') name: string) {
  const rule=await this.ruleService.findOneByName(name);
  if (rule)
    return rule
  else
    return new NotFoundException(`rule with name ${name} not found`);
  }

  @Patch(':id')
  @Roles(RulePrivileges.UPDATE_RULE)
  @ApiOperation({ summary: 'Update a rule' })
  @ApiOkResponse({
    description: 'The rule has been updated successfully',
    type: Rule,
  })
  update(
    @Param('id') id: string,
    @Body() updateRuleDto: UpdateRuleDto,
    @Request() req,
  ) {
    return this.ruleService.duplicateRule(id, updateRuleDto, req);
  }

  
  @Patch(':id/transition')
  @ApiOperation({ summary: 'Transition rule state' })
  @ApiOkResponse({
    description: 'The rule state has been updated successfully',
    type: Rule,
  })
  transitionRule(
    @Param('id') id: string,
    @Body() updateRuleDto: UpdateRuleStateDto,
    @Request() req,
  ) {
    return this.ruleService.updateStateOnly(id, updateRuleDto.state, req);
  }



  @Delete(':id')
  @Roles(RulePrivileges.DELETE_RULE)
  @ApiOperation({ summary: 'Delete a rule' })
  @ApiNoContentResponse({
    description: 'The rule has been successfully deleted',
  })
  remove(@Param('id') id: string, @Request() req) {
    return this.ruleService.remove(id, req);
  }

  @Post(':id/disable')
  @Roles(RulePrivileges.DISABLE_RULE)
  @ApiOperation({ summary: 'Disable a rule' })
  @ApiOkResponse({ description: 'The rule has been disabled', type: Rule })
  disableRule(@Param('id') id: string, @Request() req) {
    return this.ruleService.disableRule(id, req);
  }
}
