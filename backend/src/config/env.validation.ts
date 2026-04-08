type EnvShape = {
  PORT: number;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  CORS_ORIGIN: string;
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

  if (!jwtSecret) {
    throw new Error('JWT_SECRET is required');
  }

  return {
    PORT: Number.isNaN(port) ? 3000 : port,
    JWT_SECRET: jwtSecret,
    JWT_EXPIRES_IN: jwtExpiresIn,
    CORS_ORIGIN: corsOrigin,
  };
};
