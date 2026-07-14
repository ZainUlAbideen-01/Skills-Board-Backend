import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  username: string;
  name: string;
  email: string;
  password?: string;
  isVerified: boolean;
  photoUrl?: string;
  location?: {
    city?: string;
    neighborhood?: string;
    lat: number;
    lng: number;
  };
  bio?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username:   { type: String, required: true, unique: true, lowercase: true, trim: true },
    name:       { type: String, required: true, trim: true },
    email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:   { type: String },
    isVerified: { type: Boolean, default: false },
    photoUrl:   { type: String },
    location: {
      city:         { type: String },
      neighborhood: { type: String },
      lat:          { type: Number },
      lng:          { type: Number },
    },
    bio: { type: String, maxlength: 300 },
  },
  { timestamps: true }
);

UserSchema.index({ 'location.lat': 1, 'location.lng': 1 });

export default mongoose.model<IUser>('User', UserSchema);