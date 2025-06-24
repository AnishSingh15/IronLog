export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3001,
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://ironlog:password@localhost:5432/ironlog',
};
