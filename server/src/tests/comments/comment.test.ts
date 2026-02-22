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

describe("Comments API", () => {
  let token: string;
  let userId: string;
  let postId: string;
  let commentId: string;

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
    await mongoose.connection.collection("comments").deleteMany({});

    const user = await UserModel.create({ username: "testuser", passwordHash: "fakehash" });
    userId = user._id.toString();
    token = generateToken(userId, "testuser");

    const post = await PostModel.create({ authorId: userId, text: "Test post" });
    postId = post._id.toString();
  });

  afterAll(async () => {
    await mongoose.connection.collection("users").deleteMany({});
    await mongoose.connection.collection("posts").deleteMany({});
    await mongoose.connection.collection("comments").deleteMany({});
  });

  it("should add a comment successfully", async () => {
    const res = await request(app)
      .post(`/comments/${postId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ text: "Great post!" });

    expect(res.status).toBe(201);
    expect(res.body.text).toBe("Great post!");
    expect(res.body.authorId._id).toBe(userId);
    commentId = res.body._id;
  });

  it("should fail to add a comment without text", async () => {
    const res = await request(app)
      .post(`/comments/${postId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ text: "" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Text is required");
  });

  it("should fail to add a comment without auth", async () => {
    const res = await request(app)
      .post(`/comments/${postId}`)
      .send({ text: "No auth comment" });

    expect(res.status).toBe(401);
  });

  it("should get comments for a post", async () => {
    await request(app)
      .post(`/comments/${postId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ text: "First comment" });

    const res = await request(app)
      .get(`/comments/${postId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].text).toBe("First comment");
  });

  it("should delete a comment successfully", async () => {
    const createRes = await request(app)
      .post(`/comments/${postId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ text: "Comment to delete" });

    const res = await request(app)
      .delete(`/comments/${createRes.body._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Comment deleted");
  });

  it("should fail to delete a comment of another user", async () => {
    const createRes = await request(app)
      .post(`/comments/${postId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ text: "Protected comment" });

    const otherToken = generateToken(
      new mongoose.Types.ObjectId().toString(),
      "otheruser"
    );

    const res = await request(app)
      .delete(`/comments/${createRes.body._id}`)
      .set("Authorization", `Bearer ${otherToken}`);

    expect(res.status).toBe(403);
  });
});