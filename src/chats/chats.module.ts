import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ChatController } from './chats.controller';
import { ChatService } from './chats.service';
import { ChatSchema } from './Schema/chats.schema';


@Module({
  imports: [MongooseModule.forFeature([{ name: 'Chats', schema: ChatSchema }])],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
