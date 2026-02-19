import request from "supertest";
import jwt from "jsonwebtoken";
import { app } from "../app";

describe("GET /debug/whoami", () => {
  it("returns 401 when missing token", async () => {
    const res = await request(app).get("/debug/whoami");
    expect(res.status).toBe(401);
  });

  it("returns 200 with valid token", async () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is missing");

    const token = jwt.sign(
      { userId: "test-user-id", username: "tokenuser" },
      secret,
      { expiresIn: "10m" }
    );

    const res = await request(app)
      .get("/debug/whoami")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe("tokenuser");
    expect(res.body.user.userId).toBe("test-user-id");
  });
});
