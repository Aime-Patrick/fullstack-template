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

  async findAllByUser(userId: string): Promise<Item[]> {
    return this.itemsRepository.findAllByUser(userId);
  }

  async findOneByUser(userId: string, id: string): Promise<Item> {
    const item = await this.itemsRepository.findOneByUser(userId, id);
    if (!item) {
      throw new NotFoundException('Item not found');
    }
    return item;
  }

  async create(userId: string, dto: CreateItemDto): Promise<Item> {
    return this.itemsRepository.create(userId, dto);
  }

  async update(userId: string, id: string, dto: UpdateItemDto): Promise<Item> {
    const item = await this.itemsRepository.update(userId, id, dto);
    if (!item) {
      throw new NotFoundException('Item not found');
    }
    return item;
  }

  async remove(userId: string, id: string): Promise<{ message: string }> {
    const removed = await this.itemsRepository.remove(userId, id);
    if (!removed) {
      throw new NotFoundException('Item not found');
    }
    return { message: 'Item deleted' };
  }
}
