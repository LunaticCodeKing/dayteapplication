import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from "@nestjs/mongoose";
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SocketModule } from './socket-gateway/socket.module';
import { RoomsModule } from './rooms/rooms.module'
import { UserModule } from './users/users.module'
import { ChatModule } from "./chats/chats.module"
import { ChatInitiateModule } from './chatinitiate/chatinitiate.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationOptions: {
          allowUnknown: true,
          abortEarly: true,
      }
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
          uri: configService.get<string>('MONGODB_URL'),
          useNewUrlParser: true,
          useUnifiedTopology: true,
          useCreateIndex: true
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    UserModule,
    SocketModule,
    RoomsModule,
    ChatModule,
    ChatInitiateModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
