export interface AppConfig {
  nodeEnv: string;
  port: number;
  corsOrigins: string[];
  supabase: {
    url: string;
    projectRef: string;
    publishableKey: string;
    secretKey: string;
    jwtSecret: string;
    jwksUrl: string;
    issuer: string;
  };
}

function required(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function loadConfiguration(): AppConfig {
  const url = required('SUPABASE_URL').replace(/\/$/, '');

  return {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 4000),
    corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    supabase: {
      url,
      projectRef: process.env.SUPABASE_PROJECT_REF ?? '',
      publishableKey: process.env.SUPABASE_PUBLISHABLE_KEY ?? '',
      secretKey: process.env.SUPABASE_SECRET_KEY ?? '',
      jwtSecret: process.env.SUPABASE_JWT_SECRET ?? '',
      jwksUrl: `${url}/auth/v1/.well-known/jwks.json`,
      issuer: `${url}/auth/v1`,
    },
  };
}
