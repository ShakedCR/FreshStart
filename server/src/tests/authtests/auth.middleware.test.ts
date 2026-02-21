import request from "supertest";
import jwt from "jsonwebtoken";
import { app } from "../../app";

describe("GET /debug/whoami - Middleware Protection", () => {
  const secret = process.env.JWT_SECRET || "test_secret";

  it("returns 401 when missing Authorization header", async () => {
    const res = await request(app).get("/debug/whoami");
    expect(res.status).toBe(401);
  });

  it("returns 401 when Authorization format is invalid (missing Bearer)", async () => {
    const token = jwt.sign({ userId: "123", username: "user" }, secret);
    const res = await request(app)
      .get("/debug/whoami")
      .set("Authorization", token); 

    expect(res.status).toBe(401);
  });

  it("returns 401 when token is expired", async () => {
    const expiredToken = jwt.sign(
      { userId: "123", username: "user" },
      secret,
      { expiresIn: "0s" }
    );

    const res = await request(app)
      .get("/debug/whoami")
      .set("Authorization", `Bearer ${expiredToken}`);

    expect(res.status).toBe(401);
  });

  it("returns 401 when token is signed with a different secret", async () => {
    const wrongToken = jwt.sign(
      { userId: "123", username: "user" },
      "WRONG_SECRET"
    );

    const res = await request(app)
      .get("/debug/whoami")
      .set("Authorization", `Bearer ${wrongToken}`);

    expect(res.status).toBe(401);
  });

  it("returns 200 with valid token and correct payload", async () => {
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