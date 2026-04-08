import { Item } from './item.interface';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

export const ITEMS_REPOSITORY = 'ITEMS_REPOSITORY';

export interface ItemsRepository {
  findAllByUser(userId: string): Item[];
  findOneByUser(userId: string, id: string): Item | undefined;
  create(userId: string, dto: CreateItemDto): Item;
  update(userId: string, id: string, dto: UpdateItemDto): Item | undefined;
  remove(userId: string, id: string): boolean;
}
