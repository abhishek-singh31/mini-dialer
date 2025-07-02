import { Module } from '@nestjs/common';
import { DialerController } from 'src/modules/dialer/dialer.controller';
import { DialerService } from 'src/modules/dialer/dialer.service';

@Module({
  imports: [],
  providers: [DialerService],
  exports: [DialerService],
  controllers: [DialerController],
})
export class DialerModule {}
