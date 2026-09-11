import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter extends BaseExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost): void {
    const translated = this.translate(exception);

    if (!translated) {
      // A raw Prisma message can carry the failing query and its parameters,
      // so the detail stays in the server log and the caller gets a generic
      // 500.
      this.logger.error(
        `Unhandled Prisma error ${exception.code}: ${exception.message}`,
        exception.stack,
      );
      super.catch(new InternalServerErrorException('Serverdə gözlənilməz xəta baş verdi'), host);
      return;
    }

    super.catch(translated, host);
  }

  private translate(exception: Prisma.PrismaClientKnownRequestError): HttpException | null {
    switch (exception.code) {
      case 'P2002': {
        // The constraint target names internal columns, so it goes to the log
        // rather than to the caller.
        const target = (exception.meta?.target as string[] | undefined)?.join(', ');

        if (target) {
          this.logger.warn(`Unique constraint violation on ${target}`);
        }

        return new ConflictException('Bu dəyər artıq mövcuddur');
      }
      case 'P2003':
        return new ConflictException('Əlaqəli qeyd mövcud deyil');
      case 'P2025':
        return new NotFoundException('Qeyd tapılmadı');
      default:
        return null;
    }
  }
}
