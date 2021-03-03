import { ObjectID } from 'mongodb';
import { Document, ObjectId } from 'mongoose';


export interface ChatInitiateInterface  extends Document{
    senderId   : ObjectId
    receiverId : ObjectId
    roomId     : ObjectId
    status     : Number
    createdAt  : Date
    updatedAt  : Date
};

