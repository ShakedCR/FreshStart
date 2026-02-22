import mongoose, { Schema, InferSchemaType, Model } from "mongoose";

const postLikeSchema = new Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

postLikeSchema.index({ postId: 1, userId: 1 }, { unique: true });

export type PostLike = InferSchemaType<typeof postLikeSchema>;

export const PostLikeModel: Model<PostLike> =
  (mongoose.models.PostLike as Model<PostLike>) ||
  mongoose.model<PostLike>("PostLike", postLikeSchema);