import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { isAllowedOrigin } from './common/cors';
import { PrismaExceptionFilter } from './common/prisma-exception.filter';
import type { AppConfig } from './config/configuration';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  const corsOrigins = config.getOrThrow<string[]>('corsOrigins');

  const logger = new Logger('Bootstrap');

  app.setGlobalPrefix('api/v1');

  // This process only ever serves JSON to the SPA, so the browser should
  // execute nothing it returns and send no referrer anywhere.
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'none'"],
          frameAncestors: ["'none'"],
          scriptSrc: ["'none'"],
          styleSrc: ["'none'"],
          imgSrc: ["'none'"],
          baseUri: ["'none'"],
          formAction: ["'none'"],
        },
      },
      referrerPolicy: { policy: 'no-referrer' },
      crossOriginResourcePolicy: { policy: 'same-site' },
    }),
  );

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (error: Error | null, allow?: boolean) => void,
    ) => {
      // Same-origin and server-to-server calls arrive without an Origin header.
      if (!origin || isAllowedOrigin(origin, corsOrigins)) {
        callback(null, true);
        return;
      }

      // `false` denies by omitting the CORS headers, which is what the browser
      // expects. Throwing here aborts the response at the network layer and
      // surfaces as an opaque failure with no server-side trace.
      logger.warn(`Blocked cross-origin request from ${origin}`);
      callback(null, false);
    },
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  app.useGlobalFilters(new PrismaExceptionFilter(app.get(HttpAdapterHost).httpAdapter));
  app.enableShutdownHooks();

  const port = config.getOrThrow<number>('port');

  // Render and most other hosts route traffic to $PORT on all interfaces.
  await app.listen(port, '0.0.0.0');

  logger.log(`API listening on http://0.0.0.0:${port}/api/v1`);
  logger.log(`Allowed origins: ${corsOrigins.join(', ')}`);

  // Both keys are optional, so surface their absence at boot rather than as a
  // confusing 401 the first time somebody signs in.
  const supabase = config.getOrThrow<AppConfig['supabase']>('supabase');

  if (!supabase.secretKey) {
    logger.warn('SUPABASE_SECRET_KEY is empty: admin-only operations are unavailable');
  }

  if (!supabase.jwtSecret) {
    logger.warn(
      'SUPABASE_JWT_SECRET is empty: only asymmetric (JWKS) tokens can be verified, not legacy HS256',
    );
  }
}

void bootstrap();
