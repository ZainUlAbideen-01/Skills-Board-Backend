import mongoose, { Document, Schema } from 'mongoose';

export interface IExchange extends Document {
    matchId: mongoose.Types.ObjectId;
    participants: mongoose.Types.ObjectId[];
    completedAt: Date;
}

const ExchangeSchema = new Schema<IExchange>(
    {
        matchId: { type: Schema.Types.ObjectId, ref: 'Match', required: true },
        participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
        completedAt: { type: Date, default: Date.now },
    },
    { timestamps: false }
);

export default mongoose.model<IExchange>('Exchange', ExchangeSchema);