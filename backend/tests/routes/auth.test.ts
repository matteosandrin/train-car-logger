import { describe, it, expect } from "vitest";
import { request, createUser } from "../helpers";

describe("POST /api/auth/register", () => {
  it("registers a new user", async () => {
    const res = await request
      .post("/api/auth/register")
      .send({ username: "alice", password: "password123" });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body).toHaveProperty("userId");
    expect(res.body.username).toBe("alice");
  });

  it("normalizes username (trims and lowercases)", async () => {
    const res = await request
      .post("/api/auth/register")
      .send({ username: "  Alice  ", password: "password123" });

    expect(res.status).toBe(201);
    expect(res.body.username).toBe("alice");
  });

  it("rejects missing username", async () => {
    const res = await request
      .post("/api/auth/register")
      .send({ password: "password123" });

    expect(res.status).toBe(400);
  });

  it("rejects empty username", async () => {
    const res = await request
      .post("/api/auth/register")
      .send({ username: "   ", password: "password123" });

    expect(res.status).toBe(400);
  });

  it("rejects missing password", async () => {
    const res = await request
      .post("/api/auth/register")
      .send({ username: "alice" });

    expect(res.status).toBe(400);
  });

  it("rejects short password", async () => {
    const res = await request
      .post("/api/auth/register")
      .send({ username: "alice", password: "short" });

    expect(res.status).toBe(400);
  });

  it("rejects duplicate username", async () => {
    await createUser("alice");

    const res = await request
      .post("/api/auth/register")
      .send({ username: "alice", password: "password123" });

    expect(res.status).toBe(409);
  });

  it("rejects duplicate username case-insensitively", async () => {
    await createUser("alice");

    const res = await request
      .post("/api/auth/register")
      .send({ username: "ALICE", password: "password123" });

    expect(res.status).toBe(409);
  });
});

describe("POST /api/auth/login", () => {
  it("logs in with valid credentials", async () => {
    const user = await createUser("bob", "password123");

    const res = await request
      .post("/api/auth/login")
      .send({ username: "bob", password: "password123" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.userId).toBe(user.userId);
    expect(res.body.username).toBe("bob");
  });

  it("rejects wrong password", async () => {
    await createUser("bob", "password123");

    const res = await request
      .post("/api/auth/login")
      .send({ username: "bob", password: "wrongpassword" });

    expect(res.status).toBe(401);
  });

  it("rejects nonexistent user", async () => {
    const res = await request
      .post("/api/auth/login")
      .send({ username: "nobody", password: "password123" });

    expect(res.status).toBe(401);
  });

  it("rejects missing fields", async () => {
    const res = await request.post("/api/auth/login").send({});

    expect(res.status).toBe(400);
  });

  it("normalizes username on login", async () => {
    await createUser("carol", "password123");

    const res = await request
      .post("/api/auth/login")
      .send({ username: "  CAROL  ", password: "password123" });

    expect(res.status).toBe(200);
    expect(res.body.username).toBe("carol");
  });
});
