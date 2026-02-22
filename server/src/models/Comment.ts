import mongoose, { Schema, InferSchemaType, Model } from "mongoose";

const commentSchema = new Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    text: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

export type Comment = InferSchemaType<typeof commentSchema>;

export const CommentModel: Model<Comment> =
  (mongoose.models.Comment as Model<Comment>) ||
  mongoose.model<Comment>("Comment", commentSchema);