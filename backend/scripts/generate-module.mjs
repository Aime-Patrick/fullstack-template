#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const SRC_DIR = path.resolve(process.cwd(), "src");

const toPascal = (value) =>
  value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1).toLowerCase())
    .join("");

const toCamel = (value) => {
  const pascal = toPascal(value);
  return pascal[0].toLowerCase() + pascal.slice(1);
};

const askYesNo = async (rl, question, fallback = "y") => {
  const answer = (await rl.question(`${question} (${fallback}/n): `)).trim().toLowerCase();
  if (!answer) return fallback === "y";
  return answer === "y" || answer === "yes";
};

const ensureFile = async (filePath, content, force) => {
  try {
    if (!force) {
      await readFile(filePath, "utf8");
      return { created: false, path: filePath };
    }
  } catch {
    // file does not exist
  }
  await writeFile(filePath, content, "utf8");
  return { created: true, path: filePath };
};

const createTemplates = ({
  name,
  pascalName,
  withAuth,
  withPrisma,
}) => {
  const singular = toCamel(name.endsWith("s") ? name.slice(0, -1) : name);
  const singularPascal = toPascal(singular);
  const token = `${name.toUpperCase()}_REPOSITORY`;

  const authImports = withAuth
    ? `import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/types/auth-user.type';
`
    : "";

  const authControllerDecorators = withAuth ? "@UseGuards(JwtAuthGuard)\n" : "";
  const authUserArg = withAuth ? "@CurrentUser() user: AuthUser, " : "";
  const userIdExpr = withAuth ? "user.userId" : "'public'";

  const prismaProvider = withPrisma
    ? `    Prisma${pascalName}Repository,
    {
      provide: ${token},
      inject: [ConfigService, InMemory${pascalName}Repository, Prisma${pascalName}Repository],
      useFactory: (
        configService: ConfigService,
        inMemoryRepo: InMemory${pascalName}Repository,
        prismaRepo: Prisma${pascalName}Repository,
      ) => (configService.get('DB_PROVIDER') === 'prisma' ? prismaRepo : inMemoryRepo),
    },`
    : `    {
      provide: ${token},
      useExisting: InMemory${pascalName}Repository,
    },`;

  const prismaImport = withPrisma
    ? `import { Prisma${pascalName}Repository } from './prisma-${name}.repository';
`
    : "";

  const prismaFile = withPrisma
    ? `import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ${singularPascal} } from './${singular}.interface';
import { ${pascalName}Repository } from './${name}.repository';
import { Create${singularPascal}Dto } from './dto/create-${singular}.dto';
import { Update${singularPascal}Dto } from './dto/update-${singular}.dto';

@Injectable()
export class Prisma${pascalName}Repository implements ${pascalName}Repository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByUser(userId: string): Promise<${singularPascal}[]> {
    void userId;
    return [];
  }

  async findOneByUser(userId: string, id: string): Promise<${singularPascal} | undefined> {
    void userId;
    void id;
    return undefined;
  }

  async create(userId: string, dto: Create${singularPascal}Dto): Promise<${singularPascal}> {
    void userId;
    void dto;
    throw new Error('Implement Prisma create for ${name}');
  }

  async update(
    userId: string,
    id: string,
    dto: Update${singularPascal}Dto,
  ): Promise<${singularPascal} | undefined> {
    void userId;
    void id;
    void dto;
    return undefined;
  }

  async remove(userId: string, id: string): Promise<boolean> {
    void userId;
    void id;
    return false;
  }
}
`
    : null;

  const files = [
    {
      name: `${singular}.interface.ts`,
      content: `export interface ${singularPascal} {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
`,
    },
    {
      name: `dto/create-${singular}.dto.ts`,
      content: `import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class Create${singularPascal}Dto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
`,
    },
    {
      name: `dto/update-${singular}.dto.ts`,
      content: `import { PartialType } from '@nestjs/mapped-types';
import { Create${singularPascal}Dto } from './create-${singular}.dto';

export class Update${singularPascal}Dto extends PartialType(Create${singularPascal}Dto) {}
`,
    },
    {
      name: `${name}.repository.ts`,
      content: `import { ${singularPascal} } from './${singular}.interface';
import { Create${singularPascal}Dto } from './dto/create-${singular}.dto';
import { Update${singularPascal}Dto } from './dto/update-${singular}.dto';

export const ${token} = '${token}';

export interface ${pascalName}Repository {
  findAllByUser(userId: string): Promise<${singularPascal}[]>;
  findOneByUser(userId: string, id: string): Promise<${singularPascal} | undefined>;
  create(userId: string, dto: Create${singularPascal}Dto): Promise<${singularPascal}>;
  update(
    userId: string,
    id: string,
    dto: Update${singularPascal}Dto,
  ): Promise<${singularPascal} | undefined>;
  remove(userId: string, id: string): Promise<boolean>;
}
`,
    },
    {
      name: `in-memory-${name}.repository.ts`,
      content: `import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ${singularPascal} } from './${singular}.interface';
import { Create${singularPascal}Dto } from './dto/create-${singular}.dto';
import { Update${singularPascal}Dto } from './dto/update-${singular}.dto';
import { ${pascalName}Repository } from './${name}.repository';

@Injectable()
export class InMemory${pascalName}Repository implements ${pascalName}Repository {
  private readonly entries: ${singularPascal}[] = [];

  findAllByUser(userId: string): Promise<${singularPascal}[]> {
    return Promise.resolve(this.entries.filter((entry) => entry.createdBy === userId));
  }

  findOneByUser(userId: string, id: string): Promise<${singularPascal} | undefined> {
    return Promise.resolve(
      this.entries.find((entry) => entry.id === id && entry.createdBy === userId),
    );
  }

  create(userId: string, dto: Create${singularPascal}Dto): Promise<${singularPascal}> {
    const now = new Date().toISOString();
    const entry: ${singularPascal} = {
      id: randomUUID(),
      name: dto.name,
      description: dto.description,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    };
    this.entries.push(entry);
    return Promise.resolve(entry);
  }

  update(
    userId: string,
    id: string,
    dto: Update${singularPascal}Dto,
  ): Promise<${singularPascal} | undefined> {
    const entry = this.entries.find((item) => item.id === id && item.createdBy === userId);
    if (!entry) return Promise.resolve(undefined);
    entry.name = dto.name ?? entry.name;
    entry.description = dto.description ?? entry.description;
    entry.updatedAt = new Date().toISOString();
    return Promise.resolve(entry);
  }

  remove(userId: string, id: string): Promise<boolean> {
    const before = this.entries.length;
    const filtered = this.entries.filter(
      (entry) => !(entry.id === id && entry.createdBy === userId),
    );
    this.entries.length = 0;
    this.entries.push(...filtered);
    return Promise.resolve(this.entries.length < before);
  }
}
`,
    },
    {
      name: `${name}.service.ts`,
      content: `import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { ${pascalName}Repository } from './${name}.repository';
import { ${token} } from './${name}.repository';
import { ${singularPascal} } from './${singular}.interface';
import { Create${singularPascal}Dto } from './dto/create-${singular}.dto';
import { Update${singularPascal}Dto } from './dto/update-${singular}.dto';

@Injectable()
export class ${pascalName}Service {
  constructor(
    @Inject(${token})
    private readonly repository: ${pascalName}Repository,
  ) {}

  findAllByUser(userId: string): Promise<${singularPascal}[]> {
    return this.repository.findAllByUser(userId);
  }

  async findOneByUser(userId: string, id: string): Promise<${singularPascal}> {
    const entity = await this.repository.findOneByUser(userId, id);
    if (!entity) throw new NotFoundException('${singularPascal} not found');
    return entity;
  }

  create(userId: string, dto: Create${singularPascal}Dto): Promise<${singularPascal}> {
    return this.repository.create(userId, dto);
  }

  async update(
    userId: string,
    id: string,
    dto: Update${singularPascal}Dto,
  ): Promise<${singularPascal}> {
    const entity = await this.repository.update(userId, id, dto);
    if (!entity) throw new NotFoundException('${singularPascal} not found');
    return entity;
  }

  async remove(userId: string, id: string): Promise<{ message: string }> {
    const removed = await this.repository.remove(userId, id);
    if (!removed) throw new NotFoundException('${singularPascal} not found');
    return { message: '${singularPascal} deleted' };
  }
}
`,
    },
    {
      name: `${name}.controller.ts`,
      content: `import { Body, Controller, Delete, Get, Param, Patch, Post${withAuth ? "" : ", Query"} } from '@nestjs/common';
${authImports}import { ${pascalName}Service } from './${name}.service';
import { Create${singularPascal}Dto } from './dto/create-${singular}.dto';
import { Update${singularPascal}Dto } from './dto/update-${singular}.dto';

${authControllerDecorators}@Controller('${name}')
export class ${pascalName}Controller {
  constructor(private readonly service: ${pascalName}Service) {}

  @Get()
  findAll(${withAuth ? "@CurrentUser() user: AuthUser" : "@Query('userId') userId = 'public'"}) {
    return this.service.findAllByUser(${withAuth ? "user.userId" : "userId"});
  }

  @Get(':id')
  findOne(${authUserArg}@Param('id') id: string${withAuth ? "" : ", @Query('userId') userId = 'public'"}) {
    return this.service.findOneByUser(${userIdExpr}, id);
  }

  @Post()
  create(${authUserArg}@Body() dto: Create${singularPascal}Dto${withAuth ? "" : ", @Query('userId') userId = 'public'"}) {
    return this.service.create(${userIdExpr}, dto);
  }

  @Patch(':id')
  update(${authUserArg}@Param('id') id: string, @Body() dto: Update${singularPascal}Dto${withAuth ? "" : ", @Query('userId') userId = 'public'"}) {
    return this.service.update(${userIdExpr}, id, dto);
  }

  @Delete(':id')
  remove(${authUserArg}@Param('id') id: string${withAuth ? "" : ", @Query('userId') userId = 'public'"}) {
    return this.service.remove(${userIdExpr}, id);
  }
}
`,
    },
    {
      name: `${name}.module.ts`,
      content: `import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ${pascalName}Controller } from './${name}.controller';
import { ${pascalName}Service } from './${name}.service';
import { InMemory${pascalName}Repository } from './in-memory-${name}.repository';
import { ${token} } from './${name}.repository';
${prismaImport}
@Module({
  controllers: [${pascalName}Controller],
  providers: [
    ${pascalName}Service,
    InMemory${pascalName}Repository,
${prismaProvider}
  ],
})
export class ${pascalName}Module {}
`,
    },
  ];

  if (prismaFile) {
    files.push({
      name: `prisma-${name}.repository.ts`,
      content: prismaFile,
    });
  }

  return { files, pascalName, singularPascal, withPrisma };
};

const main = async () => {
  const rl = createInterface({ input, output });
  try {
    const rawName = (await rl.question("Module name (plural, e.g. posts): ")).trim();
    if (!rawName) {
      console.error("Module name is required.");
      process.exit(1);
    }

    const name = rawName.toLowerCase().replace(/\s+/g, "-");
    const pascalName = toPascal(name);
    const force = await askYesNo(rl, "Overwrite existing files if they exist?", "n");
    const withAuth = await askYesNo(rl, "Protect routes with JWT + CurrentUser?", "y");
    const withPrisma = await askYesNo(
      rl,
      "Add Prisma repository scaffold with DB_PROVIDER switch?",
      "y",
    );

    const moduleDir = path.join(SRC_DIR, name);
    await mkdir(moduleDir, { recursive: true });
    await mkdir(path.join(moduleDir, "dto"), { recursive: true });

    const { files } = createTemplates({ name, pascalName, withAuth, withPrisma });
    const results = [];

    for (const file of files) {
      const target = path.join(moduleDir, file.name);
      results.push(await ensureFile(target, file.content, force));
    }

    console.log(`\nGenerated module: ${name}`);
    for (const result of results) {
      console.log(`${result.created ? "  + created" : "  = skipped"} ${path.relative(process.cwd(), result.path)}`);
    }

    console.log("\nNext steps:");
    console.log(`1) Import ${pascalName}Module in src/app.module.ts`);
    if (withPrisma) {
      console.log(`2) Implement prisma-${name}.repository.ts and add Prisma model to prisma/schema.prisma`);
      console.log("3) Run: npm run prisma:generate");
    }
    console.log("4) Run: npm run lint && npm run build");
  } finally {
    rl.close();
  }
};

void main();
