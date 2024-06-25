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
  @ApiQuery({ name: 'page', type: 'number', required: false, example: 1 })
  @ApiQuery({ name: 'limit', type: 'number', required: false, example: 10 })
  @ApiOkResponse({
    description: 'All rule configurations have been successfully retrieved.',
    type: RuleConfig,
    isArray: true,
  })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<{ count: number; data: RuleConfig[] }> {
    return this.ruleConfigService.findAll({ page, limit });
  }

  @Get(':id')
  @Roles(RuleConfigPrivilege.GET_RULE_CONFIG)
  @ApiOperation({ summary: 'Get a single rule configuration by ID' })
  @ApiOkResponse({
    description: 'The rule configuration has been successfully retrieved.',
    type: RuleConfig,
  })
  findOne(@Param('id') id: string) {
    return this.ruleConfigService.findOne(id);
  }

  @Patch(':id')
  @Roles(RuleConfigPrivilege.UPDATE_RULE_CONFIG)
  @ApiOperation({ summary: 'Update a rule configuration' })
  @ApiOkResponse({
    description: 'The rule configuration has been successfully updated.',
    type: RuleConfig,
  })
  update(
    @Param('id') id: string,
    @Body() updateRuleConfigDto: UpdateRuleConfigDto,
    @Request() req,
  ) {
    return this.ruleConfigService.duplicateRuleConfig(
      id,
      updateRuleConfigDto,
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
  @Post(':id/disable')
  @Roles(RuleConfigPrivilege.DISABLE_RULE_CONFIG)
  @ApiOperation({ summary: 'Disable a rule configuration' })
  @ApiOkResponse({
    description: 'The rule configuration has been successfully disabled.',
    type: RuleConfig,
  })
  async disableRule(
    @Param('id') id: string,
    @Request() req,
  ): Promise<RuleConfig> {
    return await this.ruleConfigService.disableRuleConfig(id, req);
  }
}
