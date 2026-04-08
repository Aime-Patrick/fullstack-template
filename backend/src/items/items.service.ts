import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Item } from './item.interface';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ITEMS_REPOSITORY } from './items.repository';
import type { ItemsRepository } from './items.repository';

@Injectable()
export class ItemsService {
  constructor(
    @Inject(ITEMS_REPOSITORY)
    private readonly itemsRepository: ItemsRepository,
  ) {}

  findAllByUser(userId: string): Item[] {
    return this.itemsRepository.findAllByUser(userId);
  }

  findOneByUser(userId: string, id: string): Item {
    const item = this.itemsRepository.findOneByUser(userId, id);
    if (!item) {
      throw new NotFoundException('Item not found');
    }
    return item;
  }

  create(userId: string, dto: CreateItemDto): Item {
    return this.itemsRepository.create(userId, dto);
  }

  update(userId: string, id: string, dto: UpdateItemDto): Item {
    const item = this.itemsRepository.update(userId, id, dto);
    if (!item) {
      throw new NotFoundException('Item not found');
    }
    return item;
  }

  remove(userId: string, id: string): { message: string } {
    const removed = this.itemsRepository.remove(userId, id);
    if (!removed) {
      throw new NotFoundException('Item not found');
    }
    return { message: 'Item deleted' };
  }
}
