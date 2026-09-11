import { Global, Module } from '@nestjs/common';
import { AuditService } from './audit.service';

/// Global so any module that performs a privileged action can inject
/// AuditService without threading an import through every module file.
@Global()
@Module({
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
