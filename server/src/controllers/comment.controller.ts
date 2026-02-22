import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import { CommentModel } from "../models/Comment";
import { PostModel } from "../models/Post";
import mongoose from "mongoose";

export async function addComment(req: AuthenticatedRequest, res: Response) {
  try {
    const postId = new mongoose.Types.ObjectId(req.params.postId as string);
    const authorId = new mongoose.Types.ObjectId(req.user!.userId);
    const { text } = req.body;

    if (!text) return res.status(400).json({ error: "Text is required" });

    const comment = await CommentModel.create({ postId, authorId, text });
    await PostModel.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

    const populated = await comment.populate({ path: "authorId", model: "User", select: "username profileImage" });

    return res.status(201).json(populated);
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getComments(req: AuthenticatedRequest, res: Response) {
  try {
    const postId = new mongoose.Types.ObjectId(req.params.postId as string);

    const comments = await CommentModel.find({ postId })
      .sort({ createdAt: 1 })
      .populate({ path: "authorId", model: "User", select: "username profileImage" });

    return res.status(200).json(comments);
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function deleteComment(req: AuthenticatedRequest, res: Response) {
  try {
    const { commentId } = req.params;
    const userId = req.user!.userId;

    const comment = await CommentModel.findById(commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    if (comment.authorId?.toString() !== userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await CommentModel.findByIdAndDelete(commentId);
    await PostModel.findByIdAndUpdate(comment.postId, { $inc: { commentsCount: -1 } });

    return res.status(200).json({ message: "Comment deleted" });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}