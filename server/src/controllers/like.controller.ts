import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import { PostLikeModel } from "../models/PostLike";
import { PostModel } from "../models/Post";
import mongoose from "mongoose";

export async function likePost(req: AuthenticatedRequest, res: Response) {
  try {
    const postId = new mongoose.Types.ObjectId(req.params.postId as string);
    const userId = new mongoose.Types.ObjectId(req.user!.userId);

    const existing = await PostLikeModel.findOne({ postId, userId });
    if (existing) return res.status(409).json({ error: "Already liked" });

    await PostLikeModel.create({ postId, userId });
    await PostModel.findByIdAndUpdate(postId, { $inc: { likesCount: 1 } });

    return res.status(201).json({ message: "Liked" });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function unlikePost(req: AuthenticatedRequest, res: Response) {
  try {
    const postId = new mongoose.Types.ObjectId(req.params.postId as string);
    const userId = new mongoose.Types.ObjectId(req.user!.userId);

    const existing = await PostLikeModel.findOne({ postId, userId });
    if (!existing) return res.status(404).json({ error: "Like not found" });

    await PostLikeModel.deleteOne({ postId, userId });
    await PostModel.findByIdAndUpdate(postId, { $inc: { likesCount: -1 } });

    return res.status(200).json({ message: "Unliked" });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getLikes(req: AuthenticatedRequest, res: Response) {
  try {
    const postId = new mongoose.Types.ObjectId(req.params.postId as string);
    const userId = new mongoose.Types.ObjectId(req.user!.userId);

    const count = await PostLikeModel.countDocuments({ postId });
    const liked = await PostLikeModel.findOne({ postId, userId });

    return res.status(200).json({ count, liked: !!liked });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}