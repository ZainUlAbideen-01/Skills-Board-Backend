import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
    senderId: mongoose.Types.ObjectId;
    receiverId: mongoose.Types.ObjectId;
    listingId?: mongoose.Types.ObjectId;
    content: string;
    read: boolean;
    timestamp: Date;
}

const MessageSchema = new Schema<IMessage>(
    {
        senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        listingId: { type: Schema.Types.ObjectId, ref: 'Listing' },
        content: { type: String, required: true, maxlength: 2000 },
        read: { type: Boolean, default: false },
        timestamp: { type: Date, default: Date.now },
    },
    { timestamps: false }
);

MessageSchema.index({ senderId: 1, receiverId: 1 });
MessageSchema.index({ timestamp: -1 });

export default mongoose.model<IMessage>('Message', MessageSchema);