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
  DefaultValuePipe,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { TypologyService } from './typology.service';
import { CreateTypologyDto } from './dto/create-typology.dto';
import { UpdateTypologyDto } from './dto/update-typology.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiExcludeEndpoint,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TypologyPrivilege } from './privilege.constant';
import { Typology, TypologyRuleWithConfigs } from './entities/typology.entity';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Typology')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('typology')
export class TypologyController {
  constructor(private readonly typologyService: TypologyService) {}

  @Post()
  @Roles(TypologyPrivilege.CREATE_TYPOLOGY)
  @ApiOperation({ summary: 'Create a new typology' })
  @ApiCreatedResponse({
    description: 'The typology has been successfully created.',
    type: Typology,
  })
  create(
    @Body() createTypologyDto: CreateTypologyDto,
    @Request() req,
  ): Promise<Typology> {
    return this.typologyService.create(createTypologyDto, req);
  }

  @Get()
  @Roles(TypologyPrivilege.GET_TYPOLOGIES)
  @ApiOperation({ summary: 'Retrieve all typologies' })
  @ApiQuery({ name: 'page', type: 'number', required: false, example: 1 })
  @ApiQuery({ name: 'limit', type: 'number', required: false, example: 10 })
  @ApiOkResponse({
    description: 'All typologies have been successfully retrieved.',
    type: Typology,
    isArray: true,
  })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<{ count: number; data: Typology[] }> {
    return this.typologyService.findAll({ page, limit });
  }

  @Get(':id')
  @Roles(TypologyPrivilege.GET_TYPOLOGY)
  @ApiOperation({ summary: 'Retrieve a typology by ID' })
  @ApiOkResponse({
    description: 'The typology has been successfully retrieved.',
    type: TypologyRuleWithConfigs,
  })
  findOne(@Param('id') id: string): Promise<TypologyRuleWithConfigs> {
    return this.typologyService.findOne(id);
  }

  @Patch(':id')
  @ApiExcludeEndpoint()
  update(
    @Param('id') id: string,
    @Body() updateTypologyDto: UpdateTypologyDto,
  ) {
    return this.typologyService.update(+id, updateTypologyDto);
  }

  @Delete(':id')
  @ApiExcludeEndpoint()
  remove(@Param('id') id: string) {
    return this.typologyService.remove(+id);
  }
}
