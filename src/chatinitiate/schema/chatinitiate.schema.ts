import * as mongoose from 'mongoose';
const ObjectId = mongoose.Schema.Types.ObjectId

export const ChatInitiateSchema = new mongoose.Schema({
    // socket id
    senderId:{
        type : ObjectId,
    },
    receiverId:{
        type : ObjectId,
    },
    roomId:{
        type : ObjectId,
    },
    status:{
        type : Number
    },
    createdAt:{
        type : Date,
    },
    updatedAt:{
        type : Date
    }

});

//Remove delete_status and timestamps
ChatInitiateSchema.set('toObject', {
    transform: (doc, ret) => {
        delete ret.createdAt;
        delete ret.updatedAt;
    }
});
