import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../app";

describe("POST /auth/register - Comprehensive Tests", () => {
  beforeAll(async () => {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("MONGO_URI is missing");
    await mongoose.connect(uri);
  });

  beforeEach(async () => {
    await mongoose.connection.collection("users").deleteMany({});
    await mongoose.connection.collection("refreshtokens").deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it("should register a new user and return tokens without the password hash", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ username: "shaked", password: "123456789012" });

    expect(res.status).toBe(201);
    expect(res.body.accessToken).toBeTruthy();
    expect(res.body.refreshToken).toBeTruthy();
    expect(res.body.user.username).toBe("shaked");
    
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it("should fail when registering with an existing username", async () => {
   
    await request(app)
      .post("/auth/register")
      .send({ username: "shaked", password: "123456789012" });

    
    const res = await request(app)
      .post("/auth/register")
      .send({ username: "shaked", password: "anotherpassword123" });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe("Username already taken");
  });

  it("should reject passwords shorter than 12 characters", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ username: "shaked", password: "short" });

    expect(res.status).toBe(400);
  });

  it("should fail if username is missing", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ password: "123456789012" });

    expect(res.status).toBe(400);
  });
});