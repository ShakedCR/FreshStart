import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../app";

describe("POST /auth/login", () => {
  beforeAll(async () => {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("MONGO_URI is missing");
    await mongoose.connect(uri);
  });

  beforeEach(async () => {
    await mongoose.connection.collection("users").deleteMany({});
    await mongoose.connection.collection("refreshtokens").deleteMany({});
    
    await request(app)
      .post("/auth/register")
      .send({ username: "shaked", password: "123456789012" });
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });


  it("should login successfully and return correct user object and tokens", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ username: "shaked", password: "123456789012" });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeTruthy();
    expect(res.body.refreshToken).toBeTruthy();
    expect(res.body.user.username).toBe("shaked");
    expect(res.body.user.id).toBeTruthy();
    expect(res.body.user.passwordHash).toBeUndefined(); 
  });

  it("should fail with status 401 for non-existing user", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ username: "unknown_user", password: "123456789012" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid credentials");
  });

  it("should fail with status 401 for wrong password", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ username: "shaked", password: "wrongpassword123" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid credentials");
  });

  it("should fail with status 400 for missing fields (Zod validation)", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ username: "shaked" }); 
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid input");
  });
});