import { Module,HttpModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ChatInitiateController } from './chatinitiate.controller';
import { ChatInitiateService } from './chatinitiate.service';
import { ChatInitiateSchema } from './schema/chatinitiate.schema'
import { RoomsController } from "../rooms/rooms.controller"
import { ChatSchema } from "../chats/Schema/chats.schema"
import { ChatService } from "../chats/chats.service"
import { ChatRoomSchema } from "../rooms/Schema/rooms.schema"
import { RoomsService } from 'src/rooms/rooms.service';

@Module({
  imports     : [
      MongooseModule.forFeature([
        { name: 'ChatIntiate', schema: ChatInitiateSchema },
        { name: 'Room', schema: ChatRoomSchema },
        { name: 'Chats', schema: ChatSchema }
      ]),
      HttpModule,
  ],
  controllers : [ChatInitiateController,RoomsController],
  providers   : [ChatInitiateService,ChatService,RoomsService],
  exports     : [ChatInitiateService],
})

export class ChatInitiateModule {}
