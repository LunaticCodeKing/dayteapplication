import * as mongoose from 'mongoose';
const ObjectId = mongoose.Schema.Types.ObjectId

export const ChatSchema = new mongoose.Schema({

    roomId: {
        type: String
    },
    senderId: {
        type: String
    },
    recieverId: {
        type: String
    },
    message: {
        type: String
    },
    /*  
        0 => text+8
        1 => Image
        2 => document
        3 => voice
        4 => video call
        5 => audio call
    */
    messageType: {
        type: Number
    },
    imageUrl:{
        type: String
    },
    read: { // 0 => unread, 1 => readed
        type: Number,
        default: 0
    },
    clearHistory: { // 0 => not clear, 1 => cleared
        type: Number,
        default: 0
    },
    clearedBy: {
        type: ObjectId,
        ref: 'user'
    },
    deleteStatus: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: ObjectId,
        ref: 'user'
    },
    updatedBy: {
        type: ObjectId,
        ref: 'user'
    },
},{timestamps: true});