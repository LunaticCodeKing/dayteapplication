import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model,ObjectId } from 'mongoose';

import { ChatRoomInterface } from './Interfaces/room.interface';


@Injectable()
export class RoomsService {
  constructor(
    @InjectModel('Room') private readonly roomModel: Model<ChatRoomInterface>) {}

  async create(userId : ObjectId) {
      const newRoom = new this.roomModel({ userId : userId });
      return await newRoom.save();
  }

  async createRoom(data: any) {
    const newRoom = new this.roomModel(data);
    return await newRoom.save();
  }

  async findAll(options?: any): Promise<ChatRoomInterface[]> {
     return await this.roomModel.find(options).exec();
  }

  async findById(senderId: ObjectId): Promise<any | null> {
    let roomDetails : any = []
    roomDetails = await this.roomModel.findOne({userId : senderId}).exec();
    return roomDetails
  }

  async findOne(options?: any, fields?: any): Promise<ChatRoomInterface | null> {
    return await this.roomModel.findOne(options, fields).exec();
  }

  async update(id: string, newValue: ChatRoomInterface): Promise<ChatRoomInterface | null> {
    return await this.roomModel.findByIdAndUpdate(id, newValue).exec();
  }

  async delete(id: string): Promise<ChatRoomInterface | null> {
    return await this.roomModel.findByIdAndDelete({_id : id}).exec();
  }
}
