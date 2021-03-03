import { Module,HttpModule } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { RoomsService } from '../rooms/rooms.service'
import { ChatRoomSchema } from '../rooms/Schema/rooms.schema'
import { ChatInitiateService } from "../chatinitiate/chatinitiate.service"
import { ChatInitiateSchema } from '../chatinitiate/schema/chatinitiate.schema'
import { ChatSchema } from "../chats/Schema/chats.schema"
import { ChatService } from '../chats/chats.service'


@Module({
  imports: [MongooseModule.forFeature([
      { name : 'ChatIntiate', schema : ChatInitiateSchema },
      { name : 'Room', schema : ChatRoomSchema},
      { name : 'Chats', schema : ChatSchema }
  ]),
  HttpModule
  ],
  controllers : [],
  providers : [SocketGateway,RoomsService,ChatInitiateService,ChatService],
  exports   : [SocketGateway,RoomsService,ChatInitiateService,ChatService]
})
export class SocketModule {}
