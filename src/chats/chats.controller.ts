import {
    Controller,
    Get,
    Post,
    Body,
    Query,
    Request,
    Response,
    HttpException,
    HttpStatus,
    Patch,
    Res,
    NotFoundException,
    Param,
    BadRequestException,
  } from '@nestjs/common';


  import { ObjectId } from 'mongoose';
  import { ChatService } from './chats.service';
  import { ChatInterface } from './Interfaces/chats.interface';
  import { ApiQuery } from '@nestjs/swagger';
  import { PaginationConstants,MessageConstants } from 'src/common/constants';


  
  const FCM = require('fcm-node');
  const serverKey = 'AAAAWdWgEZ4:APA91bEseF-DacVKUOtgQeuR63vyLzQIUSksdSwNTpU4vWBGckY14Pm4Et47Y7jkJUj0RoCxgbnlKyTol7_zWHBjg-IEGZ_Ns1GTKqTNMuWfaLSNzfQdipuKlqJAQRAHMDlkwjYA_0r7'; // put your server key here
  const fcm = new FCM(serverKey);
  
  @Controller('chatroom')
  export class ChatController {
    constructor(private readonly chatservice: ChatService) {}
  
    @Get(':id')
    async getChat(@Request() req): Promise<ChatInterface> {
        const id = req.params.id;
        if (!id)
          throw new HttpException('ID parameter is missing',HttpStatus.BAD_REQUEST);
    
        const room = await this.chatservice.findById(id);
        if (!room)
            throw new HttpException(`The room with the id: ${id} does not exists`,HttpStatus.BAD_REQUEST); 
        return room;
    }

    @Get('chat/history')
    @ApiQuery({ name: 'page' , required: false })
    @ApiQuery({ name: 'limit', required: false })
    async chatHistory(
        @Res() res,
        @Query() query,
        @Query('page') page: number = 0, 
        @Query('limit') limit: number = PaginationConstants.LIMIT
        ) {

        if (!query.roomId)
          throw new HttpException(
              'ID parameter is missing',
              HttpStatus.BAD_REQUEST,
          );

        let skip: number;
        page ? (skip = (page - 1) * limit) : (skip = 0);
          
        const filterQuery = {
            roomId      : query.roomId,
        }

        const chathistory  = await this.chatservice.chatHistory(filterQuery,skip,limit);
        const count        = await this.chatservice.countAll(filterQuery);
               
        if (!chathistory.length)
            throw new NotFoundException(MessageConstants.DATA_NOT_FOUND); 

        return res.status(HttpStatus.OK).json({
            message : MessageConstants.DATA_FOUND,
            data    : { chat : chathistory,total_count: count }
        })
    }

    @Patch('chat/updatereadstatus/:id')
    async updateReadChatStatus(@Res() res, @Param('id') id: ObjectId) {
        if(!id){
           throw new NotFoundException(MessageConstants.DATA_NOT_FOUND)
        }

        const updatedStatus = await this.chatservice.updateReadStatus(id);
        if(!updatedStatus){
            throw new NotFoundException(MessageConstants.NOT_MODIFIED)
        }
        return res.status(HttpStatus.OK).json({
            message : MessageConstants.UPDATE_SUCCESS,
            data    : { chat : updatedStatus }
        })
    }

    @Patch('chat/updatedeletestatus/:id')
    async updateDeletedChatStatus(@Res() res, @Param('id') id: ObjectId) {
      if(!id){
         throw new NotFoundException(MessageConstants.DATA_NOT_FOUND)
      }
      const updatedStatus = await this.chatservice.updateDeleteStatus(id);
      if(!updatedStatus){
          throw new NotFoundException(MessageConstants.DELETED_UNSUCCESS)
      }
      return res.status(HttpStatus.OK).json({
          message : MessageConstants.DELETED_SUCCESS,
          data    : { chat : updatedStatus }
      })
    } 

        
    @Post('chat/uploadimages')
    async uploadImage(@Res() res, @Body() body) {
        try {
            let imageUrl : any  = body.imageUrl
            let message  : any
            if (!imageUrl.length) 
                throw new BadRequestException('Required galleries');
            
            let multiplePathResponse : any = []
            let imgPath : string
            
            if(imageUrl.length <= 5){
                for (let img of imageUrl) {
                    imgPath = await this.chatservice.uploadBase64ImgS3(img)
                    for(let i = 0; i < imageUrl.length; i++){
                        multiplePathResponse.push(imageUrl[i])
                    }
                    message = "image uploaded successfully"
                    if (!imgPath) {
                        throw new NotFoundException('Unable to upload image')
                    }
                }
            }else{
                multiplePathResponse.push("imageurl overflow")
                message = "unable to upload the image"
            }

            return res.status(201).json({
                message  : message,
                data     : {ImageUrl : multiplePathResponse}
            });
        }
        catch (error) {
            console.log('err>', error);
            throw new BadRequestException(error.message)
        }
    }
      

    @Post('chat/sendnotifications')
    async sendfcmNotification(@Response() res) {
       let notify = { 
          to: 'registration_token', 
          notification: {
              title: 'Title of your push notification', 
              body: 'Body of your push notification' 
          },
          data: {
              my_key: 'my value',
              my_another_key: 'my another value'
          } 
       }

       fcm.send(notify, function(err, response){
          if (err) {
              console.log("Something has gone wrong!");
          } else {
              console.log("Successfully sent with response: ", response);
          }
       });
       return await res.status(HttpStatus.OK).json({ notify });
    }

}
  