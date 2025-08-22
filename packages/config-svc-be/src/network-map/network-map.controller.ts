// <!-- SPDX-License-Identifier: Apache-2.0 -->
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { NetworkMapService } from './network-map.service';
import { CreateNetworkMapDto } from './dto/create-network-map.dto';
// import { UpdateNetworkMapDto } from './dto/update-network-map.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { NetworkMapPrivilege } from './privilege.constant';
import { NetworkMap } from './entities/network-map.entity';
import { NetworkMapTransition } from './entities/network-map-transition.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateNetworkMapDto } from './dto/update-network-map.dto';
import { TransitionNetworkMapDto } from './dto/transition-network-map.dto';



@ApiTags('Network Map')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('network-map')
export class NetworkMapController {
  constructor(private readonly networkMapService: NetworkMapService) {}

  @Post()
  @Roles(NetworkMapPrivilege.CREATE_NETWORK_MAP)
  @ApiOperation({ summary: 'Create a new network map' })
  @ApiCreatedResponse({
    description: 'The network map has been successfully created.',
    type: NetworkMap,
  })
  create(
    @Body() createNetworkMapDto: CreateNetworkMapDto,
    @Request() req,
  ): Promise<NetworkMap> {
    return this.networkMapService.create(createNetworkMapDto, req);
  }

  @Get()
  @Roles('SECURITY_VIEW_RULE') // replace with actual network map privilege if defined
  @ApiOperation({ summary: 'Retrieve all network maps' })
  @ApiQuery({ name: 'page', type: 'number', required: false, example: 1 })
  @ApiQuery({ name: 'limit', type: 'number', required: false, example: 10 })
  @ApiOkResponse({
    description: 'List of network maps',
    type: NetworkMap, // replace with the actual entity class if needed
    isArray: true,
  })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Request() req,
  ) {
    return this.networkMapService.findAll({ page, limit }, req.user);
  }



  @Get(':id')
  @Roles(NetworkMapPrivilege.GET_NETWORK_MAP)
  @ApiOperation({ summary: 'Retrieve a network map by ID' })
  @ApiOkResponse({
    description: 'The network map has been successfully retrieved.',
    type: NetworkMap,
  })
  findOne(@Param('id') id: string): Promise<NetworkMap> {
    return this.networkMapService.findOne(id);
  }

  @Get('name/:name')
  @Roles(NetworkMapPrivilege.GET_NETWORK_MAP)
  @ApiOperation({ summary: 'Retrieve a network map by Name' })
  @ApiOkResponse({
    description: 'The network map has been successfully retrieved.',
    type: NetworkMap,
  })
  findOneByName(@Param('name') name: string): Promise<NetworkMap> {
    return this.networkMapService.findOneByName(name);
  }


  @Patch(':id')
  @Roles(NetworkMapPrivilege.UPDATE_NETWORK_MAP)
  @ApiOperation({ summary: 'Update a network map by ID' })
  @ApiOkResponse({
    description: 'The network map has been successfully updated.',
    type: NetworkMap,
  })
  update(
    @Param('id') id: string,
    @Body() updateNetworkMapDto: UpdateNetworkMapDto,
    @Request() req,
  ): Promise<NetworkMap> {
    return this.networkMapService.updateNetworkMap(id, updateNetworkMapDto, req);
  }


  // NEW DEDICATED ENDPOINT FOR STATE TRANSITIONS
  @Patch(':id/transition')
  @Roles(NetworkMapPrivilege.UPDATE_NETWORK_MAP) // Adjusted privilege key
  @ApiOperation({ summary: 'Transition the state of a network map' })
  @ApiOkResponse({
    description: 'The network map state has been successfully transitioned.',
    type: NetworkMapTransition, // Replace with your actual NetworkMap class/model
  })
  transition(
    @Param('id') id: string,
    @Body() transitionNetworkMapDto: TransitionNetworkMapDto,
    @Request() req,
  ) {
    return this.networkMapService.transitionNetworkMapState(
      id,
      transitionNetworkMapDto.state,
      req,
    );
  }




}
