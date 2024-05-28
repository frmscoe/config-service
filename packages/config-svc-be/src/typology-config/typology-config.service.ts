import { Injectable } from '@nestjs/common';
import { CreateTypologyConfigDto } from './dto/create-typology-config.dto';
import { UpdateTypologyConfigDto } from './dto/update-typology-config.dto';

@Injectable()
export class TypologyConfigService {
  create(createTypologyConfigDto: CreateTypologyConfigDto) {
    return 'This action adds a new typologyConfig';
  }

  findAll() {
    return `This action returns all typologyConfig`;
  }

  findOne(id: number) {
    return `This action returns a #${id} typologyConfig`;
  }

  update(id: number, updateTypologyConfigDto: UpdateTypologyConfigDto) {
    return `This action updates a #${id} typologyConfig`;
  }

  remove(id: number) {
    return `This action removes a #${id} typologyConfig`;
  }
}
