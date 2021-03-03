import * as mongoose from 'mongoose';
import ObjectId = mongoose.Types.ObjectId

export const ChatUserSchema = new mongoose.Schema({
    userID   : { type : ObjectId },
    username : { type : String,trim:true },
});

export interface ChatUserSchema extends mongoose.Document {
    userID   : ObjectId;
    username : string;
}