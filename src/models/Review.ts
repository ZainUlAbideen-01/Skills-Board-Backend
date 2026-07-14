import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
    exchangeId: mongoose.Types.ObjectId;
    reviewerId: mongoose.Types.ObjectId;
    revieweeId: mongoose.Types.ObjectId;
    rating: number;
    comment?: string;
    createdAt: Date;
}

const ReviewSchema = new Schema<IReview>(
    {
        exchangeId: { type: Schema.Types.ObjectId, ref: 'Exchange', required: true },
        reviewerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        revieweeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, maxlength: 500 },
    },
    { timestamps: true }
);

ReviewSchema.index({ exchangeId: 1, reviewerId: 1 }, { unique: true });

export default mongoose.model<IReview>('Review', ReviewSchema);