import mongoose, { Schema, InferSchemaType, Model } from "mongoose";

const postSchema = new Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    text: {
      type: String,
      required: true
    },
    imagePath: {
      type: String,
      default: ""
    },
    likesCount: {
      type: Number,
      default: 0
    },
    commentsCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export type Post = InferSchemaType<typeof postSchema>;


export type PostWithDetails = Post & {
  isLiked?: boolean;
  authorId: {
    _id: string;
    username: string;
    profileImage: string;
  };
};

export const PostModel: Model<Post> =
  (mongoose.models.Post as Model<Post>) || mongoose.model<Post>("Post", postSchema);