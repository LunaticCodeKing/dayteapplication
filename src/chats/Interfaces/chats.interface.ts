import { Document, ObjectId } from 'mongoose';

export interface ChatInterface extends Document {
    roomId       : string
    senderId     : string
    recieverId   : string
    message      : string
    messageType  : Number
    imageUrl     : string
    read         : Number
    clearHistory : Number
    clearedBy    : ObjectId
    deleteStatus : Number
    createdBy    : ObjectId
    updatedBy    : ObjectId
}
  