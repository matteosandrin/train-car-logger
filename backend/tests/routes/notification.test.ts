import { describe, it, expect } from "vitest";
import { request, createUser, authHeader, makeEntry } from "../helpers";

describe("POST /api/notifications", () => {
  it("returns 401 without auth", async () => {
    const res = await request
      .post("/api/notifications")
      .send({ entries: [{ loggedCarId: 1, friendUserId: 2 }] });

    expect(res.status).toBe(401);
  });

  it("marks notifications as delivered", async () => {
    const alice = await createUser("alice");
    const bob = await createUser("bob");

    // Create a shared car scenario
    await request
      .post("/api/logs")
      .set("Authorization", authHeader(alice.token))
      .send({ entries: [makeEntry({ car: "5555" })] });

    await request
      .post("/api/logs")
      .set("Authorization", authHeader(bob.token))
      .send({ entries: [makeEntry({ car: "5555" })] });

    // Get alice's shared cars to find the IDs
    const shared = await request
      .get("/api/logs/shared-cars")
      .set("Authorization", authHeader(alice.token));

    const car = shared.body.friends[0].cars[0];

    const res = await request
      .post("/api/notifications")
      .set("Authorization", authHeader(alice.token))
      .send({
        entries: [
          { loggedCarId: car.id, friendUserId: bob.userId },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);

    // Verify it shows as notified now
    const after = await request
      .get("/api/logs/shared-cars")
      .set("Authorization", authHeader(alice.token));

    expect(after.body.friends[0].cars[0].notified).toBe(true);
  });

  it("deduplicates notifications", async () => {
    const alice = await createUser("alice");
    const bob = await createUser("bob");

    await request
      .post("/api/logs")
      .set("Authorization", authHeader(alice.token))
      .send({ entries: [makeEntry({ car: "5555" })] });

    await request
      .post("/api/logs")
      .set("Authorization", authHeader(bob.token))
      .send({ entries: [makeEntry({ car: "5555" })] });

    const shared = await request
      .get("/api/logs/shared-cars")
      .set("Authorization", authHeader(alice.token));

    const car = shared.body.friends[0].cars[0];
    const entry = { loggedCarId: car.id, friendUserId: bob.userId };

    await request
      .post("/api/notifications")
      .set("Authorization", authHeader(alice.token))
      .send({ entries: [entry] });

    // Second post with same data should not fail
    const res = await request
      .post("/api/notifications")
      .set("Authorization", authHeader(alice.token))
      .send({ entries: [entry] });

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(0);
  });

  it("rejects empty entries", async () => {
    const user = await createUser();

    const res = await request
      .post("/api/notifications")
      .set("Authorization", authHeader(user.token))
      .send({ entries: [] });

    expect(res.status).toBe(400);
  });

  it("rejects invalid entry shape", async () => {
    const user = await createUser();

    const res = await request
      .post("/api/notifications")
      .set("Authorization", authHeader(user.token))
      .send({ entries: [{ loggedCarId: "abc" }] });

    expect(res.status).toBe(400);
  });

  it("handles multiple notifications in one request", async () => {
    const alice = await createUser("alice");
    const bob = await createUser("bob");
    const carol = await createUser("carol");

    // Alice, bob, and carol all log same car
    const carEntry = makeEntry({ car: "7777" });
    await request
      .post("/api/logs")
      .set("Authorization", authHeader(alice.token))
      .send({ entries: [carEntry] });
    await request
      .post("/api/logs")
      .set("Authorization", authHeader(bob.token))
      .send({ entries: [makeEntry({ car: "7777" })] });
    await request
      .post("/api/logs")
      .set("Authorization", authHeader(carol.token))
      .send({ entries: [makeEntry({ car: "7777" })] });

    const shared = await request
      .get("/api/logs/shared-cars")
      .set("Authorization", authHeader(alice.token));

    const entries = shared.body.friends.flatMap((f: any) =>
      f.cars.map((c: any) => ({
        loggedCarId: c.id,
        friendUserId: f.id,
      }))
    );

    const res = await request
      .post("/api/notifications")
      .set("Authorization", authHeader(alice.token))
      .send({ entries });

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(entries.length);
  });
});
