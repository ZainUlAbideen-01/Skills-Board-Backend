import mongoose, { Document, Schema } from 'mongoose';

export interface IMatch extends Document {
    listingIdA: mongoose.Types.ObjectId;
    listingIdB: mongoose.Types.ObjectId;
    userIdA: mongoose.Types.ObjectId;
    userIdB: mongoose.Types.ObjectId;
    matchedAt: Date;
}

const MatchSchema = new Schema<IMatch>(
    {
        listingIdA: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
        listingIdB: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
        userIdA: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        userIdB: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        matchedAt: { type: Date, default: Date.now },
    },
    { timestamps: false }
);

MatchSchema.index({ userIdA: 1 });
MatchSchema.index({ userIdB: 1 });

export default mongoose.model<IMatch>('Match', MatchSchema);