import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ItemsController } from './items.controller';
import { InMemoryItemsRepository } from './in-memory-items.repository';
import { ITEMS_REPOSITORY } from './items.repository';
import { ItemsService } from './items.service';
import { PrismaItemsRepository } from './prisma-items.repository';

@Module({
  controllers: [ItemsController],
  providers: [
    ItemsService,
    InMemoryItemsRepository,
    PrismaItemsRepository,
    {
      provide: ITEMS_REPOSITORY,
      inject: [ConfigService, InMemoryItemsRepository, PrismaItemsRepository],
      useFactory: (
        configService: ConfigService,
        inMemoryRepo: InMemoryItemsRepository,
        prismaRepo: PrismaItemsRepository,
      ) =>
        configService.get('DB_PROVIDER') === 'prisma'
          ? prismaRepo
          : inMemoryRepo,
    },
  ],
})
export class ItemsModule {}
