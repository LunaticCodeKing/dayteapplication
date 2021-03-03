import { Res,Req,Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model,ObjectId } from 'mongoose';
import { ChatInterface } from './Interfaces/chats.interface';

import * as AWS from 'aws-sdk';

@Injectable()
export class ChatService {
  constructor(@InjectModel('Chats') private readonly chatModel: Model<ChatInterface>) {}

    async createChat(data : any) {
        const newChat = new this.chatModel(data);
        const result  = await newChat.save();
        return result;
    }

    async chatHistory(filterQuery: any = {},skip,limit) : Promise<any> {
        return await this.chatModel.find({
            "roomId"      : {"$in" : [filterQuery.roomId]},
        })
        .sort({ createdAt : -1 }).skip(parseInt(skip)).limit(parseInt(limit))
    }
 
       
    async uploadBase64ImgS3(base64: any) {
        AWS.config.update({
            accessKeyId     : process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey : process.env.AWS_SECRET_ACCESS_KEY,
            region          : process.env.AWS_REGION
        });

        const s3 = new AWS.S3();
        const base64Data = Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ""), 'base64');
        const type = base64.split(';')[0].split('/')[1];
        const userId = `user-${Date.now()}`;

        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: `${userId}.${type}`, // type is not required
            Body: base64Data,
            ACL: 'public-read',
            ContentEncoding: 'base64', // required
            ContentType: `image/${type}` // required. Notice the back ticks
        }
      
        let location : any = '';
        let key : any = '';

        try {
          const { Location, Key } = await s3.upload(params).promise();
          location = Location
          location.replace(location, "location");
          key = Key;
        } catch (error) {
        }
        return  location;
    }

    async roomId(roomQuery:any = {}) : Promise<ChatInterface | any> {
        const res = await this.chatModel.findOne(roomQuery).exec(); 
        return res
    }

    async countAll(filterQuery:any = {}): Promise<number> {
        return this.chatModel.countDocuments(filterQuery).exec();
    }

    async updateReadStatus(id : ObjectId): Promise<ChatInterface | null> {
        return await this.chatModel.findOneAndUpdate({_id : id},{"$set": { read : 1}}).exec();
    }   

    async updateDeleteStatus(id : ObjectId): Promise<ChatInterface | null> {
        return await this.chatModel.findOneAndUpdate({_id : id},{"$set": { deleteStatus : 1}}).exec();
    }   

    async findAll(options?: any): Promise<ChatInterface[]> {
        return await this.chatModel.find(options).exec();
    }

    async findWithLimit(id: string, limit: number): Promise<ChatInterface | null> {
        return await this.chatModel
        .findById(id)
        .slice('messages', limit)
        .exec();
    }

    async findById(id: string): Promise<ChatInterface | null> {
        return await this.chatModel.findById(id).exec();
    }

    async findOne(options?: any, fields?: any): Promise<ChatInterface | null> {
        return await this.chatModel.findOne(options, fields).exec();
    }
}
