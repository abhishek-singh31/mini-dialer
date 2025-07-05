import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { DialerModule } from 'src/modules/dialer/dialer.module';
import { CallingModule } from 'src/modules/calling/calling.module';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DialerModule,
    CallingModule,
  ],
  providers: [AppService],
})
export class AppModule {}
