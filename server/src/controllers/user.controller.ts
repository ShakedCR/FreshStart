import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import { UserModel } from "../models/User";
import { PostModel } from "../models/Post";
import { PostLikeModel } from "../models/PostLike";
import path from "path";
import fs from "fs";

export async function getProfile(req: AuthenticatedRequest, res: Response) {
  try {
    const username = req.params.username as string;

    const user = await UserModel.findOne({ username }).select("-passwordHash").lean();
    if (!user) return res.status(404).json({ error: "User not found" });

    const postsCount = await PostModel.countDocuments({ authorId: (user as any)._id });

    return res.status(200).json({ ...user, postsCount });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function updateProfile(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const { username } = req.body;

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (username && username !== user.username) {
      const existing = await UserModel.findOne({ username: username as string });
      if (existing) return res.status(409).json({ error: "Username already taken" });
      user.username = username;
    }

    if (req.file) {
      if (user.profileImage) {
        const oldPath = path.join(__dirname, "../../", user.profileImage);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      user.profileImage = `/uploads/${req.file.filename}`;
    }

    await user.save();

    const userObj = user.toObject() as any;
    delete userObj.passwordHash;
    return res.status(200).json(userObj);
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getUserPosts(req: AuthenticatedRequest, res: Response) {
  try {
    const username = req.params.username as string;
    const userId = req.user!.userId;

    const user = await UserModel.findOne({ username }).lean();
    if (!user) return res.status(404).json({ error: "User not found" });

    const posts = await PostModel.find({ authorId: (user as any)._id })
      .sort({ _id: -1 })
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

    return res.status(200).json(postsWithLikes);
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}