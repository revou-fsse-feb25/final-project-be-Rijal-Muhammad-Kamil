import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { EventModule } from './event/event.module';

import { EventOrganizerModule } from './event-organizer/event-organizer.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, UserModule, AuthModule, EventModule, EventOrganizerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
