import request from "supertest";
import mongoose from "mongoose";
import { app } from "../app";

describe("POST /auth/login", () => {
  beforeAll(async () => {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("MONGO_URI is missing");
    await mongoose.connect(uri);
  });

  beforeEach(async () => {
    await mongoose.connection.collection("users").deleteMany({});
    // create a user via register (so passwordHash is correct)
    await request(app)
      .post("/auth/register")
      .send({ username: "shaked", password: "123456789012" });
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it("logs in with correct credentials and returns token", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ username: "shaked", password: "123456789012" });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.username).toBe("shaked");
  });

  it("rejects wrong password", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ username: "shaked", password: "wrongpassword123" });

    expect(res.status).toBe(401);
  });

  it("rejects non-existing user", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ username: "nope", password: "123456789012" });

    expect(res.status).toBe(401);
  });
});
