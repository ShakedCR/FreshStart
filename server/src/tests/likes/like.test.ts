import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../app";
import jwt from "jsonwebtoken";
import { UserModel } from "../../models/User";
import { PostModel } from "../../models/Post";

const secret = process.env.JWT_SECRET || "test_secret";

function generateToken(userId: string, username: string) {
  return jwt.sign({ userId, username }, secret, { expiresIn: "1h" });
}

describe("Likes API", () => {
  let token: string;
  let userId: string;
  let postId: string;

  beforeAll(async () => {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("MONGO_URI is missing");
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri);
    }
  });

  beforeEach(async () => {
    await mongoose.connection.collection("users").deleteMany({});
    await mongoose.connection.collection("posts").deleteMany({});
    await mongoose.connection.collection("postlikes").deleteMany({});

    const user = await UserModel.create({ username: "testuser", passwordHash: "fakehash" });
    userId = user._id.toString();
    token = generateToken(userId, "testuser");

    const post = await PostModel.create({ authorId: userId, text: "Test post" });
    postId = post._id.toString();
  });

  afterAll(async () => {
    await mongoose.connection.collection("users").deleteMany({});
    await mongoose.connection.collection("posts").deleteMany({});
    await mongoose.connection.collection("postlikes").deleteMany({});
  });

  it("should like a post successfully", async () => {
    const res = await request(app)
      .post(`/likes/${postId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Liked");
  });

  it("should not like a post twice", async () => {
    await request(app)
      .post(`/likes/${postId}`)
      .set("Authorization", `Bearer ${token}`);

    const res = await request(app)
      .post(`/likes/${postId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(409);
    expect(res.body.error).toBe("Already liked");
  });

  it("should unlike a post successfully", async () => {
    await request(app)
      .post(`/likes/${postId}`)
      .set("Authorization", `Bearer ${token}`);

    const res = await request(app)
      .delete(`/likes/${postId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Unliked");
  });

  it("should fail to unlike a post that was not liked", async () => {
    const res = await request(app)
      .delete(`/likes/${postId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Like not found");
  });

  it("should get likes count and liked status", async () => {
    await request(app)
      .post(`/likes/${postId}`)
      .set("Authorization", `Bearer ${token}`);

    const res = await request(app)
      .get(`/likes/${postId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
    expect(res.body.liked).toBe(true);
  });

  it("should fail without auth", async () => {
    const res = await request(app)
      .post(`/likes/${postId}`);

    expect(res.status).toBe(401);
  });
});