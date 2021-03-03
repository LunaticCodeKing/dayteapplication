import { Injectable, Res, HttpService } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Query } from 'mongoose';
import { ChatInitiateInterface } from './interfaces/chatinitiate.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ChatInitiateService {
  constructor(
    @InjectModel('ChatIntiate')
    private readonly chatinitiatemodel: Model<ChatInitiateInterface>,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async requestUser(
    senderId: ObjectId,
    receiverId: ObjectId,
  ): Promise<any | null> {
    let result: any;
    let userCheck: any;
    let request: any;
    userCheck = await this.findRequestStatusUserId(senderId);
    if (userCheck.length != 0) {
      return `ALREADY REQUESTED`;
    } else {
      request = new this.chatinitiatemodel({
        senderId: senderId,
        receiverId: receiverId,
        status: 0,
      });
      result = await request.save();
    }
    return result;
  }

  async create(data: any): Promise<any> {
    const chatInitiate = new this.chatinitiatemodel(data);
    return await chatInitiate.save();
  }
  
  async findOne(filterQuery: any): Promise<any> {
    return await this.chatinitiatemodel.find(filterQuery);
  }

  async findRequestStatusUserId(senderId: ObjectId): Promise<any> {
    return await this.chatinitiatemodel.find(
      { receiverId: senderId },
      { status: 0 },
    );
  }

  async requestUserStatus(
    filterQuery: any = {},
  ): Promise<ChatInitiateInterface[]> {
    return await this.chatinitiatemodel.find(filterQuery);
  }

  async updateRoomidChatInitiate(id: ObjectId, roomId: ObjectId): Promise<any> {
    return await this.chatinitiatemodel.findOneAndUpdate(
      { _id: id },
      { roomId: roomId },
    );
  }

  async updateUserStatus(id: ObjectId, status: number): Promise<any> {
    return await this.chatinitiatemodel
      .findByIdAndUpdate({ _id: id }, { $set: { status: status } })
      .exec();
  }

  async findAll(
    filterQuery: any = {},
    skip,
    limit,
  ): Promise<ChatInitiateInterface[]> {
    return this.chatinitiatemodel
      .find(filterQuery)
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .exec();
  }

  async countAll(filterQuery: any = {}): Promise<number> {
    return this.chatinitiatemodel.countDocuments(filterQuery).exec();
  }

  async findById(id: string): Promise<ChatInitiateInterface | null> {
    return await this.chatinitiatemodel.findById(id).exec();
  }

  async find(
    options?: any,
    fields?: any,
  ): Promise<ChatInitiateInterface | null> {
    return await this.chatinitiatemodel.findOne(options, fields).exec();
  }

  async update(
    id: string,
    newValue: ChatInitiateInterface,
  ): Promise<ChatInitiateInterface | null> {
    return await this.chatinitiatemodel.findByIdAndUpdate(id, newValue).exec();
  }

  async delete(id: string): Promise<ChatInitiateInterface | null> {
    return await this.chatinitiatemodel.findByIdAndDelete({ _id: id }).exec();
  }

  async getUserDetails(id: any) {
    // id = '5ff416e860d91b1373414666';
    const url = `${this.configService.get<string>(
      'USER_SERVICE_URL',
    )}users/${id}`;
    const headers = {
      'Content-Type': 'application/json',
    };
    let result = await this.httpService.get(url, { headers }).toPromise();
    return {
      statusCode: result.status,
      data: result.data.data.user,
      message: result.data.message,
    };
  }
}
