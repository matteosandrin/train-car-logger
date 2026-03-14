import { describe, it, expect } from "vitest";
import { request, createUser, authHeader, makeEntry } from "../helpers";

describe("logs auth guard", () => {
  it("POST /api/logs returns 401 without auth", async () => {
    const res = await request
      .post("/api/logs")
      .send({ entries: [makeEntry()] });
    expect(res.status).toBe(401);
  });

  it("GET /api/logs returns 401 without auth", async () => {
    const res = await request.get("/api/logs");
    expect(res.status).toBe(401);
  });

  it("DELETE /api/logs returns 401 without auth", async () => {
    const res = await request
      .delete("/api/logs")
      .send({ entries: [makeEntry()] });
    expect(res.status).toBe(401);
  });

  it("PATCH /api/logs/1 returns 401 without auth", async () => {
    const res = await request
      .patch("/api/logs/1")
      .send({ notes: "test" });
    expect(res.status).toBe(401);
  });

  it("GET /api/logs/station-pairs returns 401 without auth", async () => {
    const res = await request.get("/api/logs/station-pairs");
    expect(res.status).toBe(401);
  });

  it("GET /api/logs/shared-cars returns 401 without auth", async () => {
    const res = await request.get("/api/logs/shared-cars");
    expect(res.status).toBe(401);
  });

  it("returns 401 with invalid token", async () => {
    const res = await request
      .get("/api/logs")
      .set("Authorization", "Bearer invalidtoken");
    expect(res.status).toBe(401);
  });
});

describe("POST /api/logs", () => {
  it("inserts entries", async () => {
    const user = await createUser();
    const entries = [makeEntry(), makeEntry()];

    const res = await request
      .post("/api/logs")
      .set("Authorization", authHeader(user.token))
      .send({ entries });

    expect(res.status).toBe(200);
    expect(res.body.accepted).toBe(2);
    expect(res.body.total).toBe(2);
  });

  it("deduplicates on conflict", async () => {
    const user = await createUser();
    const entry = makeEntry();

    await request
      .post("/api/logs")
      .set("Authorization", authHeader(user.token))
      .send({ entries: [entry] });

    const res = await request
      .post("/api/logs")
      .set("Authorization", authHeader(user.token))
      .send({ entries: [entry] });

    expect(res.body.accepted).toBe(0);
    expect(res.body.total).toBe(1);
  });

  it("stores optional fields", async () => {
    const user = await createUser();
    const entry = makeEntry({
      notes: "spotted at rush hour",
      origin: "G14",
      destination: "G22",
    });

    await request
      .post("/api/logs")
      .set("Authorization", authHeader(user.token))
      .send({ entries: [entry] });

    const getRes = await request
      .get("/api/logs")
      .set("Authorization", authHeader(user.token));

    const stored = getRes.body.entries[0];
    expect(stored.notes).toBe("spotted at rush hour");
    expect(stored.origin).toBe("G14");
    expect(stored.destination).toBe("G22");
  });

  it("rejects empty entries array", async () => {
    const user = await createUser();

    const res = await request
      .post("/api/logs")
      .set("Authorization", authHeader(user.token))
      .send({ entries: [] });

    expect(res.status).toBe(400);
  });

  it("rejects missing entries", async () => {
    const user = await createUser();

    const res = await request
      .post("/api/logs")
      .set("Authorization", authHeader(user.token))
      .send({});

    expect(res.status).toBe(400);
  });

  it("rejects invalid entry shape", async () => {
    const user = await createUser();

    const res = await request
      .post("/api/logs")
      .set("Authorization", authHeader(user.token))
      .send({ entries: [{ car: "1234" }] });

    expect(res.status).toBe(400);
  });
});

describe("GET /api/logs", () => {
  it("returns entries ordered by timestamp DESC", async () => {
    const user = await createUser();
    const older = makeEntry({ timestamp: 1000 });
    const newer = makeEntry({ timestamp: 2000 });

    await request
      .post("/api/logs")
      .set("Authorization", authHeader(user.token))
      .send({ entries: [older, newer] });

    const res = await request
      .get("/api/logs")
      .set("Authorization", authHeader(user.token));

    expect(res.status).toBe(200);
    expect(res.body.entries).toHaveLength(2);
    expect(res.body.entries[0].timestamp).toBe(2000);
    expect(res.body.entries[1].timestamp).toBe(1000);
  });

  it("returns empty array when no entries", async () => {
    const user = await createUser();

    const res = await request
      .get("/api/logs")
      .set("Authorization", authHeader(user.token));

    expect(res.body.entries).toEqual([]);
  });

  it("isolates entries between users", async () => {
    const alice = await createUser("alice");
    const bob = await createUser("bob");

    await request
      .post("/api/logs")
      .set("Authorization", authHeader(alice.token))
      .send({ entries: [makeEntry()] });

    const res = await request
      .get("/api/logs")
      .set("Authorization", authHeader(bob.token));

    expect(res.body.entries).toHaveLength(0);
  });
});

describe("DELETE /api/logs", () => {
  it("deletes matching entries", async () => {
    const user = await createUser();
    const entry = makeEntry();

    await request
      .post("/api/logs")
      .set("Authorization", authHeader(user.token))
      .send({ entries: [entry] });

    const res = await request
      .delete("/api/logs")
      .set("Authorization", authHeader(user.token))
      .send({ entries: [entry] });

    expect(res.status).toBe(200);
    expect(res.body.deleted).toBe(1);

    const getRes = await request
      .get("/api/logs")
      .set("Authorization", authHeader(user.token));
    expect(getRes.body.entries).toHaveLength(0);
  });

  it("returns deleted:0 for nonexistent entry", async () => {
    const user = await createUser();

    const res = await request
      .delete("/api/logs")
      .set("Authorization", authHeader(user.token))
      .send({ entries: [makeEntry()] });

    expect(res.body.deleted).toBe(0);
  });

  it("cannot delete another user's entry", async () => {
    const alice = await createUser("alice");
    const bob = await createUser("bob");
    const entry = makeEntry();

    await request
      .post("/api/logs")
      .set("Authorization", authHeader(alice.token))
      .send({ entries: [entry] });

    const res = await request
      .delete("/api/logs")
      .set("Authorization", authHeader(bob.token))
      .send({ entries: [entry] });

    expect(res.body.deleted).toBe(0);
  });

  it("rejects invalid entries", async () => {
    const user = await createUser();

    const res = await request
      .delete("/api/logs")
      .set("Authorization", authHeader(user.token))
      .send({ entries: [{ car: "1234" }] });

    expect(res.status).toBe(400);
  });
});

describe("PATCH /api/logs/:id", () => {
  it("updates notes", async () => {
    const user = await createUser();

    await request
      .post("/api/logs")
      .set("Authorization", authHeader(user.token))
      .send({ entries: [makeEntry()] });

    const getRes = await request
      .get("/api/logs")
      .set("Authorization", authHeader(user.token));
    const id = getRes.body.entries[0].id;

    const res = await request
      .patch(`/api/logs/${id}`)
      .set("Authorization", authHeader(user.token))
      .send({ notes: "updated note" });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);

    const verify = await request
      .get("/api/logs")
      .set("Authorization", authHeader(user.token));
    expect(verify.body.entries[0].notes).toBe("updated note");
  });

  it("returns 404 for nonexistent entry", async () => {
    const user = await createUser();

    const res = await request
      .patch("/api/logs/99999")
      .set("Authorization", authHeader(user.token))
      .send({ notes: "test" });

    expect(res.status).toBe(404);
  });

  it("cannot update another user's entry", async () => {
    const alice = await createUser("alice");
    const bob = await createUser("bob");

    await request
      .post("/api/logs")
      .set("Authorization", authHeader(alice.token))
      .send({ entries: [makeEntry()] });

    const getRes = await request
      .get("/api/logs")
      .set("Authorization", authHeader(alice.token));
    const id = getRes.body.entries[0].id;

    const res = await request
      .patch(`/api/logs/${id}`)
      .set("Authorization", authHeader(bob.token))
      .send({ notes: "hacked" });

    expect(res.status).toBe(404);
  });

  it("rejects invalid id", async () => {
    const user = await createUser();

    const res = await request
      .patch("/api/logs/abc")
      .set("Authorization", authHeader(user.token))
      .send({ notes: "test" });

    expect(res.status).toBe(400);
  });

  it("rejects missing notes", async () => {
    const user = await createUser();

    await request
      .post("/api/logs")
      .set("Authorization", authHeader(user.token))
      .send({ entries: [makeEntry()] });

    const getRes = await request
      .get("/api/logs")
      .set("Authorization", authHeader(user.token));
    const id = getRes.body.entries[0].id;

    const res = await request
      .patch(`/api/logs/${id}`)
      .set("Authorization", authHeader(user.token))
      .send({});

    expect(res.status).toBe(400);
  });
});

describe("GET /api/logs/station-pairs", () => {
  it("returns pairs grouped and ordered by count", async () => {
    const user = await createUser();
    const entries = [
      makeEntry({ origin: "A01", destination: "A02", line: "A" }),
      makeEntry({ origin: "A01", destination: "A02", line: "A" }),
      makeEntry({ origin: "A03", destination: "A04", line: "A" }),
    ];

    await request
      .post("/api/logs")
      .set("Authorization", authHeader(user.token))
      .send({ entries });

    const res = await request
      .get("/api/logs/station-pairs")
      .set("Authorization", authHeader(user.token));

    expect(res.status).toBe(200);
    expect(res.body.pairs).toHaveLength(2);
    expect(res.body.pairs[0].count).toBe(2);
    expect(res.body.pairs[0].origin).toBe("A01");
    expect(res.body.pairs[0].destination).toBe("A02");
    expect(res.body.pairs[1].count).toBe(1);
  });

  it("filters by line", async () => {
    const user = await createUser();
    const entries = [
      makeEntry({ origin: "A01", destination: "A02", line: "A" }),
      makeEntry({ origin: "G01", destination: "G02", line: "G" }),
    ];

    await request
      .post("/api/logs")
      .set("Authorization", authHeader(user.token))
      .send({ entries });

    const res = await request
      .get("/api/logs/station-pairs?line=G")
      .set("Authorization", authHeader(user.token));

    expect(res.body.pairs).toHaveLength(1);
    expect(res.body.pairs[0].origin).toBe("G01");
  });

  it("respects limit", async () => {
    const user = await createUser();
    const entries = [
      makeEntry({ origin: "A01", destination: "A02" }),
      makeEntry({ origin: "A03", destination: "A04" }),
    ];

    await request
      .post("/api/logs")
      .set("Authorization", authHeader(user.token))
      .send({ entries });

    const res = await request
      .get("/api/logs/station-pairs?limit=1")
      .set("Authorization", authHeader(user.token));

    expect(res.body.pairs).toHaveLength(1);
  });

  it("respects minCount filter", async () => {
    const user = await createUser();
    const entries = [
      makeEntry({ origin: "A01", destination: "A02" }),
      makeEntry({ origin: "A01", destination: "A02" }),
      makeEntry({ origin: "A03", destination: "A04" }),
    ];

    await request
      .post("/api/logs")
      .set("Authorization", authHeader(user.token))
      .send({ entries });

    const res = await request
      .get("/api/logs/station-pairs?min=2")
      .set("Authorization", authHeader(user.token));

    expect(res.body.pairs).toHaveLength(1);
    expect(res.body.pairs[0].count).toBe(2);
  });

  it("excludes entries with null origin/destination", async () => {
    const user = await createUser();
    const entries = [
      makeEntry({ origin: "A01", destination: "A02" }),
      makeEntry(), // no origin/destination
    ];

    await request
      .post("/api/logs")
      .set("Authorization", authHeader(user.token))
      .send({ entries });

    const res = await request
      .get("/api/logs/station-pairs")
      .set("Authorization", authHeader(user.token));

    expect(res.body.pairs).toHaveLength(1);
  });
});

describe("GET /api/logs/shared-cars", () => {
  it("returns cars shared with other users", async () => {
    const alice = await createUser("alice");
    const bob = await createUser("bob");

    // Both log the same car number
    await request
      .post("/api/logs")
      .set("Authorization", authHeader(alice.token))
      .send({ entries: [makeEntry({ car: "5555" })] });

    await request
      .post("/api/logs")
      .set("Authorization", authHeader(bob.token))
      .send({ entries: [makeEntry({ car: "5555" })] });

    const res = await request
      .get("/api/logs/shared-cars")
      .set("Authorization", authHeader(alice.token));

    expect(res.status).toBe(200);
    expect(res.body.friends).toHaveLength(1);
    expect(res.body.friends[0].username).toBe("bob");
    expect(res.body.friends[0].cars).toHaveLength(1);
    expect(res.body.friends[0].cars[0].car).toBe("5555");
  });

  it("marks unnotified cars as notified:false", async () => {
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

    const res = await request
      .get("/api/logs/shared-cars")
      .set("Authorization", authHeader(alice.token));

    expect(res.body.friends[0].cars[0].notified).toBe(false);
  });

  it("returns empty friends when no shared cars", async () => {
    const alice = await createUser("alice");
    const bob = await createUser("bob");

    await request
      .post("/api/logs")
      .set("Authorization", authHeader(alice.token))
      .send({ entries: [makeEntry({ car: "1111" })] });

    await request
      .post("/api/logs")
      .set("Authorization", authHeader(bob.token))
      .send({ entries: [makeEntry({ car: "2222" })] });

    const res = await request
      .get("/api/logs/shared-cars")
      .set("Authorization", authHeader(alice.token));

    expect(res.body.friends).toHaveLength(0);
  });
});
