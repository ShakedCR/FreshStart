import request from "supertest";
import mongoose from "mongoose";
import { app } from "../app";

describe("POST /auth/register", () => {
  beforeAll(async () => {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("MONGO_URI is missing");
    await mongoose.connect(uri);
  });

  beforeEach(async () => {
    await mongoose.connection.collection("users").deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it("registers a new user and returns token", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ username: "shaked", password: "123456789012" });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.username).toBe("shaked");
  });

  it("rejects short passwords", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ username: "shaked", password: "short" });

    expect(res.status).toBe(400);
  });

  it("rejects duplicate username", async () => {
    await request(app)
      .post("/auth/register")
      .send({ username: "shaked", password: "123456789012" });

    const res2 = await request(app)
      .post("/auth/register")
      .send({ username: "shaked", password: "123456789012" });

    expect(res2.status).toBe(409);
  });
});
