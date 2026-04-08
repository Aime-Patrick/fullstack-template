import { Module } from '@nestjs/common';
import { ItemsController } from './items.controller';
import { InMemoryItemsRepository } from './in-memory-items.repository';
import { ITEMS_REPOSITORY } from './items.repository';
import { ItemsService } from './items.service';

@Module({
  controllers: [ItemsController],
  providers: [
    ItemsService,
    InMemoryItemsRepository,
    {
      provide: ITEMS_REPOSITORY,
      useExisting: InMemoryItemsRepository,
    },
  ],
})
export class ItemsModule {}
