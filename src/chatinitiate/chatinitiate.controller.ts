import {
    Controller,
    Res,
    Req,
    Get,
    Post,
    Body,
    HttpException,
    HttpStatus,
    Patch,
    Query,
    NotFoundException,
    BadRequestException,
    Param
  } from '@nestjs/common';

  import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
  import { ObjectId } from 'mongoose';
  import { PaginationConstants, MessageConstants } from '../common/constants';
  import { ChatInitiateService } from './chatinitiate.service';
  import { ChatService } from '../chats/chats.service';
  import { RoomsService } from '../rooms/rooms.service';

  @Controller('chatinitiate')
  export class ChatInitiateController {
    constructor(
            private readonly chatInitiateservice: ChatInitiateService,
            private readonly chatService : ChatService,
            private readonly roomService : RoomsService
        ) {}

    @Get('chat/requeststatus')
    async getRequestChat(@Res() res,@Query() query) {
        if (!query.senderId || !query.receiverId)
            throw new HttpException('ID parameter is missing',HttpStatus.BAD_REQUEST);

        let filterQuery : any =  {
            senderId      : { $in : [query.senderId,query.receiverId]},
            receiverId    : { $in : [query.senderId,query.receiverId]}
        }

        let requestedUsersStatus : any = await this.chatInitiateservice.requestUserStatus(filterQuery);
        console.log(requestedUsersStatus)

        if(requestedUsersStatus.length == 0){
            requestedUsersStatus = "CHAT NOT INITIATED"
        }

        if (!requestedUsersStatus)
            throw new HttpException(`No request for: ${requestedUsersStatus}`,HttpStatus.BAD_REQUEST); 

        return res.status(HttpStatus.OK).json({
            message : MessageConstants.DATA_FOUND,
            data    : { requestedUsersStatus : requestedUsersStatus }
        })
    }  

    @Post('chat/request')
    async requestChat(
        @Res() res,
        @Body('senderId') senderId: ObjectId,
        @Body('receiverId') receiverId : ObjectId
        ) {
        
        if (!senderId || !receiverId)
           throw new HttpException('ID parameter is missing',HttpStatus.BAD_REQUEST);
        
        let filterQuery : any =  {
            senderId      : senderId,
            receiverId    : receiverId,
        }    

        let requestedUsers : any
        let checkUserRequest : any = await this.chatInitiateservice.requestUserStatus(filterQuery); 
        if(!(checkUserRequest.length == 0)){
            requestedUsers = "ALREADY REQUEST SENT BY  " + senderId
        }else{
            requestedUsers = await this.chatInitiateservice.requestUser(senderId,receiverId);
        }
      
        if (!requestedUsers)
            throw new HttpException(
                `No request for: ${requestedUsers}`,HttpStatus.BAD_REQUEST
        ); 

        return res.status(HttpStatus.OK).json({
            message : MessageConstants.DATA_FOUND,
            data    : { 
                requestedUser : requestedUsers ,
                senderId,
                receiverId
            }
        })
    }   

  @ApiBearerAuth()
  @ApiQuery({ name: 'skip', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @Get('chat/users-list')
  async usersList(
    @Res() res,
    @Query() query,
    @Query('skip') skip: number = 0,
    @Query('limit') limit: number = PaginationConstants.LIMIT,
  ) {
    try {
      let filterQuery: any = {};
      let userId: any;

      if (query.senderId) {
        (filterQuery.senderId = query.senderId),
          (filterQuery.status = JSON.parse(query.status));
      }

      if (query.receiverId) {
        (filterQuery.receiverId = query.receiverId),
          (filterQuery.status = JSON.parse(query.status));
      }

      const users = await this.chatInitiateservice.findAll(
          filterQuery,
          skip,
          limit,
      );

      const count = await this.chatInitiateservice.countAll(filterQuery);

      let newUsers = [];
      if (users) {
        let u: any;
        for (u of users) {
          u = await u.toJSON();
          console.log(u)
          
          if (!u.roomId) {
            console.log("inside the roomQuery")
            let roomQuery: any = {
              senderId: { $in: [u.senderId, u.receiverId] },
              recieverId: { $in: [u.receiverId, u.senderId] },
            };
            let roomData: any = await this.chatService.roomId(roomQuery);

            if (roomData) {
              await this.chatInitiateservice.updateRoomidChatInitiate(
                u._id,
                roomData.roomId,
              );
              u.roomId = roomData.roomId;
            }
          }

          if(query.senderId){
              userId = u.receiverId
          }else if(query.receiverId){
              userId = u.senderId
          }

          let user: any = await this.chatInitiateservice.getUserDetails(userId);

          if (user && user.data) {
            u.profileimage = user.data.profileImg
              ? user.data.profileImg.imgPath
              : '';
            u.firstname = user.data.firstname;
            u.lastname = user.data.lastname;
          }
          newUsers.push(u);
        }
      }

      if (!users.length)
        throw new NotFoundException(MessageConstants.DATA_NOT_FOUND);

      return res.status(HttpStatus.OK).json({
        message: MessageConstants.DATA_FOUND,
        data: { newUsers, total_count: count },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Patch('chat/users/update/:id')
  async usersAccepted(@Res() res,@Body('status') status: number,@Param('id') id: ObjectId ) {
      if(!id){
        throw new NotFoundException(MessageConstants.DATA_NOT_FOUND)
      }

      let room   : any
      let userId : any 
      let updatedUserstatus : any
      
      updatedUserstatus  = await this.chatInitiateservice.updateUserStatus(id,status);
      updatedUserstatus.status = status

      if(updatedUserstatus.status == 1){
          userId = await this.roomService.findById(updatedUserstatus.senderId)
          if(!userId){
              room   = await this.roomService.create(updatedUserstatus.senderId)
              updatedUserstatus.roomId = room._id 
              await this.chatInitiateservice.updateRoomidChatInitiate(id,room._id);
          }else{
              console.log("inside the else")
              updatedUserstatus.roomId = userId._id
              await this.chatInitiateservice.updateRoomidChatInitiate(id,userId._id);
          }         
      }

      if (!updatedUserstatus)
        throw new BadRequestException(
            MessageConstants.UPDATE_FAILED
        ); 
        return res.status(HttpStatus.OK).json({
            message: MessageConstants.UPDATE_SUCCESS,
            data: { data: updatedUserstatus }
        })
    }

  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  @Patch('likes/match/:id')
  async updateCard(
    @Res() res,
    @Req() req,
    @Param('id') sender_id: string,
    @Body() data,
  ) {
    let { reciever_id, status } = data;
    try {
      let filterQuery: any = {
        senderId: { $in: [sender_id, reciever_id] },
        receiverId: { $in: [sender_id, reciever_id] },
      };
      let requiredParams: any = {
        roomId: 1,
      };
      let chatData: any;
      chatData = await this.chatService.findOne(filterQuery, requiredParams);

      if (chatData) {
        chatData = { roomId: chatData.roomId };
        return res.status(200).json({
          message: 'Data fount',
          data: chatData,
        });
      } else {
        let chatInitiate: any;
        chatInitiate = await this.chatInitiateservice.findOne(filterQuery);

        if (!chatInitiate) {
          await this.chatInitiateservice.create({
            senderId: sender_id,
            receiverId: reciever_id,
            status: status,
          });
        }
        let roomData: any = await this.roomService.createRoom({
          userId: sender_id,
        });
        chatData = { roomId: roomData._id };
      }

      if (chatData)
        return res.status(HttpStatus.OK).json({
          message: 'Updated Successfully',
          data: chatData,
        });
      else return res.status(HttpStatus.NOT_MODIFIED).json();
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
  