import { Request, Response } from "express";
import { PostModel } from "../models/Post";
import { searchPostsWithAI } from "../services/ai.service";

export async function searchPosts(req: Request, res: Response) {
  try {
    const query = req.query.q as string;
    if (!query || query.trim().length === 0) {
      res.status(400).json({ error: "Query is required" });
      return;
    }

    const posts = await PostModel.find()
      .populate("authorId", "username profileImage")
      .sort({ createdAt: -1 })
      .limit(50);

    const results = await searchPostsWithAI(query, posts);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Search failed" });
  }
}