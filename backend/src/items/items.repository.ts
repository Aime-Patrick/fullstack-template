import { Item } from './item.interface';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

export const ITEMS_REPOSITORY = 'ITEMS_REPOSITORY';

export interface ItemsRepository {
  findAllByUser(userId: string): Promise<Item[]>;
  findOneByUser(userId: string, id: string): Promise<Item | undefined>;
  create(userId: string, dto: CreateItemDto): Promise<Item>;
  update(
    userId: string,
    id: string,
    dto: UpdateItemDto,
  ): Promise<Item | undefined>;
  remove(userId: string, id: string): Promise<boolean>;
}
