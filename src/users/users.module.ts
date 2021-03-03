import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './users.controller';
import { UserService } from './users.service';
import { ChatUserSchema } from './users.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Users', schema: ChatUserSchema }]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports : [UserService]
})
export class UserModule {}