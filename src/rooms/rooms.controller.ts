import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Request,
    HttpException,
    HttpStatus,
    BadRequestException,
  } from '@nestjs/common';

  import { ObjectId } from 'mongoose';
  import { MessageConstants } from '../common/constants' 
  import { RoomsService } from './rooms.service';
  import { ChatRoomInterface } from './Interfaces/room.interface';
  
  @Controller('rooms')
  export class RoomsController {
    constructor(private readonly roomsService: RoomsService) {}
  
    @Get('/allrooms')
    async index(): Promise<ChatRoomInterface[]> {
       return await this.roomsService.findAll();
    }
  
    @Post('createroom')
    async createRoom(@Body('userId') userid: ObjectId) {
        if (!userid)
          throw new HttpException('ID parameter is missing',HttpStatus.BAD_REQUEST);
        
        const generatedId = await this.roomsService.create(userid);
        if (!generatedId)
            throw new BadRequestException(
              MessageConstants.CREATE_FAILED
            ); 
        return { id: generatedId  };
    }
  

    @Delete('delete/:id')
    async delete(@Request() req) {
        const id = req.params.id;
        if (!id)
          throw new HttpException(
            'ID parameter is missing',
            HttpStatus.BAD_REQUEST,
          );
        const result = await this.roomsService.delete(id);
        if (!result)
              throw new HttpException(
                  `The room id : ${id} is deleted`,
                  HttpStatus.BAD_REQUEST, 
              ); 
        return { id: result };
      }
  }
  