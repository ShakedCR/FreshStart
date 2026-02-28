import type { Response } from "express";
import { PostModel } from "../models/Post";
import { PostLikeModel } from "../models/PostLike";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import path from "path";
import fs from "fs";

export async function createPost(req: AuthenticatedRequest, res: Response) {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required" });

    const imagePath = req.file ? `/uploads/${req.file.filename}` : "";

    const post = await PostModel.create({
      authorId: req.user!.userId,
      text,
      imagePath
    });

    const populated = await post.populate({ path: "authorId", model: "User", select: "username profileImage" });
    const postObj = populated.toObject() as any;
    postObj.isLiked = false;

    return res.status(201).json(postObj);
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getFeed(req: AuthenticatedRequest, res: Response) {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const cursor = req.query.cursor as string | undefined;
    const userId = req.user!.userId;

    const query = cursor ? { _id: { $lt: cursor } } : {};

    const posts = await PostModel.find(query)
      .sort({ _id: -1 })
      .limit(limit)
      .populate({ path: "authorId", model: "User", select: "username profileImage" });

    const postIds = posts.map(p => p._id);
    const userLikes = await PostLikeModel.find({ 
      userId, 
      postId: { $in: postIds } 
    }).select('postId');
    
    const likedPostIds = new Set(userLikes.map(like => like.postId.toString()));

    const postsWithLikes = posts.map(post => {
      const postObj = post.toObject() as any;
      postObj.isLiked = likedPostIds.has(post._id.toString());
      return postObj;
    });

    const nextCursor = posts.length === limit ? posts[posts.length - 1]?._id ?? null : null;

    return res.status(200).json({ posts: postsWithLikes, nextCursor });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function editPost(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { text, removeImage } = req.body;
    const userId = req.user!.userId;

    const post = await PostModel.findById(id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    if (post.authorId?.toString() !== userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    if (removeImage === "true" && post.imagePath) {
      const oldPath = path.join(__dirname, "../../", post.imagePath);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      post.imagePath = "";
    } else if (req.file) {
      if (post.imagePath) {
        const oldPath = path.join(__dirname, "../../", post.imagePath);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      post.imagePath = `/uploads/${req.file.filename}`;
    }

    if (text) post.text = text;
    await post.save();

    const populated = await post.populate({ path: "authorId", model: "User", select: "username profileImage" });
    const isLiked = await PostLikeModel.exists({ userId, postId: post._id });
    
    const postObj = populated.toObject() as any;
    postObj.isLiked = !!isLiked;

    return res.status(200).json(postObj);
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function deletePost(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;

    const post = await PostModel.findById(id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    if (post.authorId?.toString() !== req.user!.userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    if (post.imagePath) {
      const oldPath = path.join(__dirname, "../../", post.imagePath);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    await PostModel.findByIdAndDelete(id);
    return res.status(200).json({ message: "Post deleted" });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}