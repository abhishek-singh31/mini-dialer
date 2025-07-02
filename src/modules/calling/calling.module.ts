import { Module } from '@nestjs/common';
import { CallingController } from 'src/modules/calling/calling.controller';
import { CallingService } from 'src/modules/calling/calling.service';

@Module({
  imports: [],
  providers: [CallingService],
  exports: [CallingService],
  controllers: [CallingController],
})
export class CallingModule {}
