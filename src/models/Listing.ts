import mongoose, { Document, Schema } from 'mongoose';

export interface IListing extends Document {
    userId: mongoose.Types.ObjectId;
    type: 'offer' | 'request';
    title: string;
    category: string;
    description: string;
    availability?: string;
    radiusKm: number;
    status: 'active' | 'closed';
    location?: {
        type: 'Point';
        coordinates: [number, number];
    };
    createdAt: Date;
    updatedAt: Date;
}

const ListingSchema = new Schema<IListing>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        type: { type: String, enum: ['offer', 'request'], required: true },
        title: { type: String, required: true, trim: true },
        category: { type: String, required: true },
        description: { type: String, required: true },
        availability: { type: String },
        radiusKm: { type: Number, required: true },
        status: { type: String, enum: ['active', 'closed'], default: 'active' },
        location: {
            type: { type: String, enum: ['Point'], default: 'Point' },
            coordinates: { type: [Number] },
        },
    },
    { timestamps: true }
);

ListingSchema.index({ location: '2dsphere' });
ListingSchema.index({ category: 1 });
ListingSchema.index({ status: 1 });
ListingSchema.index({ userId: 1 });

export default mongoose.model<IListing>('Listing', ListingSchema);