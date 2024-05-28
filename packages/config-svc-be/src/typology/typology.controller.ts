import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TypologyService } from './typology.service';
import { CreateTypologyDto } from './dto/create-typology.dto';
import { UpdateTypologyDto } from './dto/update-typology.dto';
import { ApiExcludeController, ApiTags } from '@nestjs/swagger';

@ApiExcludeController()
@Controller('typology')
@ApiTags('typology')
export class TypologyController {
  constructor(private readonly typologyService: TypologyService) {}

  @Post()
  create(@Body() createTypologyDto: CreateTypologyDto) {
    return this.typologyService.create(createTypologyDto);
  }

  @Get()
  findAll() {
    return this.typologyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.typologyService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTypologyDto: UpdateTypologyDto,
  ) {
    return this.typologyService.update(+id, updateTypologyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.typologyService.remove(+id);
  }
}
