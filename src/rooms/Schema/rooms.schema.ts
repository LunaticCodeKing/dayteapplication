import * as mongoose from 'mongoose';
const ObjectId = mongoose.Schema.Types.ObjectId

export const ChatRoomSchema = new mongoose.Schema({
    // socket id
    userId: {
        type : ObjectId,
    },
    createdBy: {
        type : String,
    },
});

