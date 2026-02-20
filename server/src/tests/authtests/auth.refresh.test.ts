import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../app";
import jwt from "jsonwebtoken";

describe("POST /auth/refresh - Edge Cases", () => {
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

  it("should fail if refresh token is missing from request body", async () => {
    const res = await request(app).post("/auth/refresh").send({});
    expect(res.status).toBe(400);
  });

  it("should fail if refresh token is just a random string", async () => {
    const res = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken: "not-a-jwt-at-all" });
    expect(res.status).toBe(401);
  });

  it("should fail if refresh token is valid JWT but not in Database", async () => {
    const fakeToken = jwt.sign(
      { userId: new mongoose.Types.ObjectId().toString(), username: "hacker" },
      process.env.JWT_REFRESH_SECRET || "refresh_secret_default"
    );

    const res = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken: fakeToken });

    expect(res.status).toBe(401);
  });

  it("should fail if refresh token is expired", async () => {
    const authRes = await request(app)
      .post("/auth/register")
      .send({ username: "olduser", password: "123456789012" });
    
    const expiredToken = jwt.sign(
      { userId: authRes.body.user.id, username: "olduser" },
      process.env.JWT_REFRESH_SECRET || "refresh_secret_default",
      { expiresIn: "0s" } 
    );

    const res = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken: expiredToken });

    expect(res.status).toBe(401);
  });

  it("should return a working access token when refresh is valid", async () => {
    const authRes = await request(app)
      .post("/auth/register")
      .send({ username: "activeuser", password: "123456789012" });
    
    const refreshToken = authRes.body.refreshToken;

    const refreshRes = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken });

    expect(refreshRes.status).toBe(200);
    const newAccessToken = refreshRes.body.accessToken;

    
    const whoamiRes = await request(app)
      .get("/debug/whoami")
      .set("Authorization", `Bearer ${newAccessToken}`);

    expect(whoamiRes.status).toBe(200);
    expect(whoamiRes.body.user.username).toBe("activeuser");
  });
});