import mongoose, { Schema, InferSchemaType, Model } from "mongoose";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    email: {
      type: String,
      required: false,
      default: ""
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
    },
    quittingStartDate: {
      type: Date,
      required: false,
      default: null
    },
    quittingHistory: [
      {
        startDate: {
          type: Date,
          required: true
        },
        endDate: {
          type: Date,
          required: false,
          default: null
        },
        daysSurvived: {
          type: Number,
          required: false,
          default: 0
        }
      }
    ]
  },
  { timestamps: true }
);

export type User = InferSchemaType<typeof userSchema>;

export const UserModel: Model<User> =
  (mongoose.models.User as Model<User>) || mongoose.model<User>("User", userSchema);