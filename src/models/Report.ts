import mongoose, { Document, Schema } from 'mongoose';

export interface IReport extends Document {
    reporterId: mongoose.Types.ObjectId;
    targetType: 'user' | 'listing';
    targetId: mongoose.Types.ObjectId;
    reason: 'spam' | 'abuse' | 'inappropriate' | 'other';
    details?: string;
    status: 'pending_review' | 'resolved' | 'dismissed';
    createdAt: Date;
}

const ReportSchema = new Schema<IReport>(
    {
        reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        targetType: { type: String, enum: ['user', 'listing'], required: true },
        targetId: { type: Schema.Types.ObjectId, required: true },
        reason: { type: String, enum: ['spam', 'abuse', 'inappropriate', 'other'], required: true },
        details: { type: String, maxlength: 500 },
        status: { type: String, enum: ['pending_review', 'resolved', 'dismissed'], default: 'pending_review' },
    },
    { timestamps: true }
);

export default mongoose.model<IReport>('Report', ReportSchema);