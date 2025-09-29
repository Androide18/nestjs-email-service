import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
import { MailerModule } from './mailer/mailer.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [UsersModule, DatabaseModule, MailerModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})

/* NOTE:  
- Providers could be services, repositories, factories, helpers, and so on.
- Providers can be INJECTED as a dependency (means objects can create various relationships with each others) 
*/
export class AppModule {}
