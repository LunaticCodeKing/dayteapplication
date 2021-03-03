import { Document, ObjectId } from 'mongoose';

export interface ChatRoomInterface extends Document {
    userId    : ObjectId;
    createdBy : String;
}
  