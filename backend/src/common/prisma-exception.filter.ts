import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
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
      this.logger.error(`Unhandled Prisma error ${exception.code}`, exception.stack);
      super.catch(exception, host);
      return;
    }

    super.catch(translated, host);
  }

  private translate(exception: Prisma.PrismaClientKnownRequestError): HttpException | null {
    switch (exception.code) {
      case 'P2002': {
        const target = (exception.meta?.target as string[] | undefined)?.join(', ');
        return new ConflictException(
          target ? `Bu dəyər artıq mövcuddur: ${target}` : 'Bu dəyər artıq mövcuddur',
        );
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
