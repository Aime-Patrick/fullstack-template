import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Item } from './item.interface';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ItemsRepository } from './items.repository';

@Injectable()
export class InMemoryItemsRepository implements ItemsRepository {
  private items: Item[] = [];

  findAllByUser(userId: string): Promise<Item[]> {
    return Promise.resolve(
      this.items.filter((item) => item.createdBy === userId),
    );
  }

  findOneByUser(userId: string, id: string): Promise<Item | undefined> {
    return Promise.resolve(
      this.items.find((entry) => entry.id === id && entry.createdBy === userId),
    );
  }

  create(userId: string, dto: CreateItemDto): Promise<Item> {
    const now = new Date().toISOString();
    const item: Item = {
      id: randomUUID(),
      name: dto.name,
      description: dto.description,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    };
    this.items.push(item);
    return Promise.resolve(item);
  }

  update(
    userId: string,
    id: string,
    dto: UpdateItemDto,
  ): Promise<Item | undefined> {
    const item = this.items.find(
      (entry) => entry.id === id && entry.createdBy === userId,
    );
    if (!item) return Promise.resolve(undefined);
    item.name = dto.name ?? item.name;
    item.description = dto.description ?? item.description;
    item.updatedAt = new Date().toISOString();
    return Promise.resolve(item);
  }

  remove(userId: string, id: string): Promise<boolean> {
    const before = this.items.length;
    this.items = this.items.filter(
      (entry) => !(entry.id === id && entry.createdBy === userId),
    );
    return Promise.resolve(this.items.length < before);
  }
}
