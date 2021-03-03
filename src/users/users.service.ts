import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {  Model, ObjectId } from 'mongoose';
var ObjectID = require('mongodb').ObjectID
import { ChatUserSchema } from './users.model';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('Users') private readonly chatUsers: Model<ChatUserSchema>,
  ) {}

  async insertUser(userId : ObjectId,username : string) {
    const newUser = new this.chatUsers({
        userID   : ObjectID(userId),
        username : username,
    });
    const result = await newUser.save();
    return result
  }

  async getUserId(userId: Object) {
    const detail = await this.findUser(userId);
    return {
       userId: detail.id,
    };
  }

  async deleteUser(userId: string) {
    const result = await this.chatUsers.deleteOne({_id: userId}).exec();
    if (result.n === 0) {
      throw new NotFoundException('Could not find product.');
    }
  }

  private async findUser(id: Object): Promise<ChatUserSchema> {
    let user;
    try {
      user = await this.chatUsers.findOne({_id : id}).exec();
    } catch (error) {
      throw new NotFoundException('Could not find user.');
    }
    if (!user) {
      throw new NotFoundException('Could not find user.');
    }
    return user;
  }
}