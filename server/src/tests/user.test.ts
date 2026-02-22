import request from "supertest";
import mongoose from "mongoose";
import { app } from "../app";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/User";
import { PostModel } from "../models/Post";

const secret = process.env.JWT_SECRET || "test_secret";

function generateToken(userId: string, username: string) {
  return jwt.sign({ userId, username }, secret, { expiresIn: "1h" });
}

describe("Users API", () => {
  let token: string;
  let userId: string;

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

    const user = await UserModel.create({ username: "testuser", passwordHash: "fakehash" });
    userId = user._id.toString();
    token = generateToken(userId, "testuser");
  });

  afterAll(async () => {
    await mongoose.connection.collection("users").deleteMany({});
    await mongoose.connection.collection("posts").deleteMany({});
  });

  it("should get user profile successfully", async () => {
    const res = await request(app)
      .get("/users/testuser")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.username).toBe("testuser");
    expect(res.body.passwordHash).toBeUndefined();
    expect(res.body.postsCount).toBe(0);
  });

  it("should fail to get non-existing user profile", async () => {
    const res = await request(app)
      .get("/users/nonexistent")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("User not found");
  });

  it("should update username successfully", async () => {
    const res = await request(app)
      .put("/users/me/update")
      .set("Authorization", `Bearer ${token}`)
      .field("username", "newusername");

    expect(res.status).toBe(200);
    expect(res.body.username).toBe("newusername");
  });

  it("should fail to update to existing username", async () => {
    await UserModel.create({ username: "takenuser", passwordHash: "fakehash" });

    const res = await request(app)
      .put("/users/me/update")
      .set("Authorization", `Bearer ${token}`)
      .field("username", "takenuser");

    expect(res.status).toBe(409);
    expect(res.body.error).toBe("Username already taken");
  });

  it("should get user posts successfully", async () => {
    await PostModel.create({ authorId: userId, text: "Test post" });

    const res = await request(app)
      .get("/users/testuser/posts")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].text).toBe("Test post");
  });

  it("should fail without auth", async () => {
    const res = await request(app)
      .get("/users/testuser");

    expect(res.status).toBe(401);
  });
});