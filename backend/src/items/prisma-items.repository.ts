import { Injectable } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { Item } from './item.interface';
import { ItemsRepository } from './items.repository';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaItemsRepository implements ItemsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByUser(userId: string): Promise<Item[]> {
    const items = await this.prisma.item.findMany({
      where: { createdById: userId },
      orderBy: { createdAt: 'desc' },
    });

    return items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description ?? undefined,
      createdBy: item.createdById,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));
  }

  async findOneByUser(userId: string, id: string): Promise<Item | undefined> {
    const item = await this.prisma.item.findFirst({
      where: { id, createdById: userId },
    });
    if (!item) return undefined;
    return {
      id: item.id,
      name: item.name,
      description: item.description ?? undefined,
      createdBy: item.createdById,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }

  async create(userId: string, dto: CreateItemDto): Promise<Item> {
    const item = await this.prisma.item.create({
      data: {
        name: dto.name,
        description: dto.description,
        createdById: userId,
      },
    });
    return {
      id: item.id,
      name: item.name,
      description: item.description ?? undefined,
      createdBy: item.createdById,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateItemDto,
  ): Promise<Item | undefined> {
    const item = await this.prisma.item.findFirst({
      where: { id, createdById: userId },
    });
    if (!item) return undefined;

    const updated = await this.prisma.item.update({
      where: { id: item.id },
      data: {
        name: dto.name ?? item.name,
        description: dto.description ?? item.description,
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      description: updated.description ?? undefined,
      createdBy: updated.createdById,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  async remove(userId: string, id: string): Promise<boolean> {
    const result = await this.prisma.item.deleteMany({
      where: { id, createdById: userId },
    });
    return result.count > 0;
  }
}
