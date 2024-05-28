import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TypologyConfigService } from './typology-config.service';
import { CreateTypologyConfigDto } from './dto/create-typology-config.dto';
import { UpdateTypologyConfigDto } from './dto/update-typology-config.dto';
import { ApiExcludeController, ApiTags } from '@nestjs/swagger';

@ApiExcludeController()
@Controller('typology-config')
@ApiTags('typology Config')
export class TypologyConfigController {
  constructor(private readonly typologyConfigService: TypologyConfigService) {}

  @Post()
  create(@Body() createTypologyConfigDto: CreateTypologyConfigDto) {
    return this.typologyConfigService.create(createTypologyConfigDto);
  }

  @Get()
  findAll() {
    return this.typologyConfigService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.typologyConfigService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTypologyConfigDto: UpdateTypologyConfigDto,
  ) {
    return this.typologyConfigService.update(+id, updateTypologyConfigDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.typologyConfigService.remove(+id);
  }
}
