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
import { NetworkMapService } from './network-map.service';
import { CreateNetworkMapDto } from './dto/create-network-map.dto';
// import { UpdateNetworkMapDto } from './dto/update-network-map.dto';
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
import { NetworkMapPrivilege } from './privilege.constant';
import { NetworkMap } from './entities/network-map.entity';
import { Roles } from '../auth/decorators/roles.decorator';

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
}
