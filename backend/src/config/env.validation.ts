type EnvShape = {
  PORT: number;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  CORS_ORIGIN: string;
  DB_PROVIDER: 'inmemory' | 'prisma';
  DATABASE_URL: string;
};

export const validateEnv = (config: Record<string, unknown>): EnvShape => {
  const port = Number(config.PORT ?? 3000);
  const jwtSecret =
    typeof config.JWT_SECRET === 'string' ? config.JWT_SECRET : '';
  const jwtExpiresIn =
    typeof config.JWT_EXPIRES_IN === 'string' ? config.JWT_EXPIRES_IN : '1d';
  const corsOrigin =
    typeof config.CORS_ORIGIN === 'string'
      ? config.CORS_ORIGIN
      : 'http://localhost:3001';
  const dbProvider =
    config.DB_PROVIDER === 'prisma' ? 'prisma' : ('inmemory' as const);
  const databaseUrl =
    typeof config.DATABASE_URL === 'string' ? config.DATABASE_URL : '';

  if (!jwtSecret) {
    throw new Error('JWT_SECRET is required');
  }

  return {
    PORT: Number.isNaN(port) ? 3000 : port,
    JWT_SECRET: jwtSecret,
    JWT_EXPIRES_IN: jwtExpiresIn,
    CORS_ORIGIN: corsOrigin,
    DB_PROVIDER: dbProvider,
    DATABASE_URL: databaseUrl,
  };
};
