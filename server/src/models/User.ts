import mongoose, { Schema, InferSchemaType, Model } from "mongoose";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: false 
    },
    googleId: {
      type: String,
      required: false,
      unique: true,
      sparse: true
    },
    profileImage: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

export type User = InferSchemaType<typeof userSchema>;

export const UserModel: Model<User> =
  (mongoose.models.User as Model<User>) || mongoose.model<User>("User", userSchema);