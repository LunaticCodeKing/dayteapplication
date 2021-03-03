import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { ChatRoomSchema } from './Schema/rooms.schema';


@Module({
  imports: [MongooseModule.forFeature([{ name: 'Room', schema: ChatRoomSchema }])],
  controllers: [RoomsController],
  providers: [RoomsService],
  exports: [RoomsService],
})
export class RoomsModule {}
