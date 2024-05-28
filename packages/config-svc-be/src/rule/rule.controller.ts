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
} from '@nestjs/common';
import { RuleService } from './rule.service';
import { CreateRuleDto } from './dto/create-rule.dto';
import { UpdateRuleDto } from './dto/update-rule.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Rule, RuleWithConfigResponse } from './entities/rule.entity';
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
  @ApiOperation({ summary: 'Retrieve all rules' })
  @ApiQuery({ name: 'page', type: 'number', required: false, example: 1 })
  @ApiQuery({ name: 'limit', type: 'number', required: false, example: 10 })
  @ApiOkResponse({
    description: 'List of rules',
    type: Rule,
    isArray: true,
  })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.ruleService.findAll({ page, limit });
  }

  @Get('/rule-config')
  @Roles(RulePrivileges.GET_RULE_RULE_CONFIG)
  @ApiOperation({ summary: 'Retrieve all rule configurations' })
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

  @Get(':id')
  @Roles(RulePrivileges.GET_RULE)
  @ApiOperation({ summary: 'Get a single rule by ID' })
  @ApiOkResponse({ description: 'Details of the rule', type: Rule })
  findOne(@Param('id') id: string) {
    return this.ruleService.findOne(id);
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
