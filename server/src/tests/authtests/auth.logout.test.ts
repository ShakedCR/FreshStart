import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../app";

describe("POST /auth/logout", () => {
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
  await mongoose.connection.collection("users").deleteMany({});
  await mongoose.connection.collection("refreshtokens").deleteMany({});
});

  it("should delete the refresh token on logout and prevent its reuse", async () => {
    const authRes = await request(app)
      .post("/auth/register")
      .send({ username: "logoutuser", password: "123456789012" });
    
    const refreshToken = authRes.body.refreshToken;

    const res = await request(app)
      .post("/auth/logout")
      .send({ refreshToken });

    expect(res.status).toBe(200);

    const refreshRes = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken });

    expect(refreshRes.status).toBe(401);
  });

  it("should return 400 if refresh token is missing", async () => {
    const res = await request(app)
      .post("/auth/logout")
      .send({}); 

    expect(res.status).toBe(400);
  });

  it("should return 200 even if token does not exist (idempotent)", async () => {
    
    const res = await request(app)
      .post("/auth/logout")
      .send({ refreshToken: "non-existent-token" });

    expect(res.status).toBe(200);
  });
});