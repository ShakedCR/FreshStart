import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../app";
import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET || "test_secret";

function generateToken(userId: string, username: string) {
  return jwt.sign({ userId, username }, secret, { expiresIn: "1h" });
}

describe("Posts API", () => {
  let token: string;
  let userId: string;
  let postId: string;

  beforeAll(async () => {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("MONGO_URI is missing");
    await mongoose.connect(uri);
    userId = new mongoose.Types.ObjectId().toString();
    token = generateToken(userId, "testuser");
  });

  beforeEach(async () => {
    await mongoose.connection.collection("posts").deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.collection("posts").deleteMany({});
    await mongoose.disconnect();
  });

  it("should create a post successfully", async () => {
    const res = await request(app)
      .post("/posts")
      .set("Authorization", `Bearer ${token}`)
      .field("text", "My first post");

    expect(res.status).toBe(201);
    expect(res.body.text).toBe("My first post");
    expect(res.body.authorId).toBe(userId);
    postId = res.body._id;
  });

  it("should fail to create a post without text", async () => {
    const res = await request(app)
      .post("/posts")
      .set("Authorization", `Bearer ${token}`)
      .field("text", "");

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Text is required");
  });

  it("should fail to create a post without auth", async () => {
    const res = await request(app)
      .post("/posts")
      .field("text", "No auth post");

    expect(res.status).toBe(401);
  });

  it("should get feed successfully", async () => {
    await request(app)
      .post("/posts")
      .set("Authorization", `Bearer ${token}`)
      .field("text", "Feed post");

    const res = await request(app)
      .get("/posts/feed")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.posts).toBeTruthy();
    expect(res.body.posts.length).toBeGreaterThan(0);
  });

  it("should edit a post successfully", async () => {
    const createRes = await request(app)
      .post("/posts")
      .set("Authorization", `Bearer ${token}`)
      .field("text", "Original text");

    const res = await request(app)
      .put(`/posts/${createRes.body._id}`)
      .set("Authorization", `Bearer ${token}`)
      .field("text", "Updated text");

    expect(res.status).toBe(200);
    expect(res.body.text).toBe("Updated text");
  });

  it("should fail to edit a post of another user", async () => {
    const createRes = await request(app)
      .post("/posts")
      .set("Authorization", `Bearer ${token}`)
      .field("text", "Someone's post");

    const otherToken = generateToken(
      new mongoose.Types.ObjectId().toString(),
      "otheruser"
    );

    const res = await request(app)
      .put(`/posts/${createRes.body._id}`)
      .set("Authorization", `Bearer ${otherToken}`)
      .field("text", "Hacked!");

    expect(res.status).toBe(403);
  });

  it("should delete a post successfully", async () => {
    const createRes = await request(app)
      .post("/posts")
      .set("Authorization", `Bearer ${token}`)
      .field("text", "Post to delete");

    const res = await request(app)
      .delete(`/posts/${createRes.body._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it("should fail to delete a post of another user", async () => {
    const createRes = await request(app)
      .post("/posts")
      .set("Authorization", `Bearer ${token}`)
      .field("text", "Protected post");

    const otherToken = generateToken(
      new mongoose.Types.ObjectId().toString(),
      "otheruser"
    );

    const res = await request(app)
      .delete(`/posts/${createRes.body._id}`)
      .set("Authorization", `Bearer ${otherToken}`);

    expect(res.status).toBe(403);
  });
});