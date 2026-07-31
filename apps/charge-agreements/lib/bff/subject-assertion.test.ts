import { createHmac, timingSafeEqual } from "node:crypto";
import fixture from "../../../../contracts/security/charge-subject-assertion-v1.json";
import { issueSubjectAssertion, normalizeAssertionPath } from "./subject-assertion";

describe("Charge subject assertion contract", () => {
  it.each(fixture.vectors)("matches shared golden vector $id", (vector) => {
    const result = issueSubjectAssertion({
      kid: vector.kid,
      secret: Uint8Array.from(Buffer.from(vector.secretHex, "hex")),
      subjectId: vector.claims.sub,
      method: vector.claims.mth,
      path: vector.claims.pth,
      correlationId: vector.claims.cid,
      nowSeconds: Number(vector.claims.iat),
      nonceBytes: Uint8Array.from(Buffer.from(vector.claims.nonce, "base64url"))
    });
    expect(result.headerValue).toBe(vector.headerValue);
    expect(result.payloadUtf8Hex).toBe(vector.payloadUtf8Hex);
  });

  it("normalizes percent hex case without query authority", () => {
    expect(normalizeAssertionPath("/api/%c3%bc")).toBe("/api/%C3%BC");
    expect(() => normalizeAssertionPath("/api/a?q=1")).toThrowError("SUBJECT_ASSERTION_PATH_INVALID");
  });

  it("rejects invalid nonce, KID and correlation", () => {
    const base = {
      kid: "v1", secret: "assertion-secret-value", subjectId: "user",
      method: "GET", path: "/api/a", correlationId: "corr", nowSeconds: 1
    };
    expect(() => issueSubjectAssertion({ ...base, kid: "bad kid" })).toThrow();
    expect(() => issueSubjectAssertion({ ...base, correlationId: "bad\nid" })).toThrow();
    expect(() => issueSubjectAssertion({ ...base, nonceBytes: new Uint8Array(2) })).toThrow();
  });

  it.each(fixture.negativeCases)("executes shared negative vector $id", (negative) => {
    const vector = fixture.vectors.find((candidate) => candidate.id === negative.baseVector);
    if (!vector) throw new Error(`missing base vector ${negative.baseVector}`);
    const state = { nonces: new Set<string>(), capacity: 4096 };
    let header = vector.headerValue;
    let method = vector.claims.mth;
    let path = vector.claims.pth;
    let correlationId = vector.claims.cid;
    let now = vector.verificationInstant;

    switch (negative.mutation) {
      case "REMOVE_SIGNATURE_SEGMENT":
        header = header.split(".").slice(0, 3).join(".");
        break;
      case "VERIFY_AS_GET":
        method = "GET";
        break;
      case "VERIFY_AT_OTHER_PATH":
        path = "/api/charge-agreements/other";
        break;
      case "VERIFY_WITH_OTHER_CORRELATION":
        correlationId = "corr-other";
        break;
      case "FLIP_SIGNATURE_BYTE":
        header = `${header.slice(0, -1)}${header.endsWith("A") ? "B" : "A"}`;
        break;
      case "REPLACE_KID": {
        const parts = header.split(".");
        parts[1] = "unknown-key";
        header = parts.join(".");
        break;
      }
      case "VERIFY_TWICE":
        expect(verifyFixture(vector, header, method, path, correlationId, now, state))
          .toEqual({ status: 200, code: "OK" });
        break;
      case "VERIFY_AFTER_EXPIRY_AND_SKEW":
        now = Number(vector.claims.exp) + 6;
        break;
      case "CLAIM_4097_DISTINCT_NONCES":
        for (let index = 0; index < 4096; index += 1) state.nonces.add(`occupied-${index}`);
        break;
      default:
        throw new Error(`unsupported fixture mutation: ${negative.mutation}`);
    }

    expect(verifyFixture(vector, header, method, path, correlationId, now, state))
      .toEqual(negative.expected);
  });
});

type FixtureVector = (typeof fixture.vectors)[number];

function verifyFixture(
  vector: FixtureVector,
  header: string,
  method: string,
  path: string,
  correlationId: string,
  now: number,
  state: { nonces: Set<string>; capacity: number }
): { status: number; code: string } {
  const invalid = { status: 401, code: "INVALID_SUBJECT_ASSERTION" };
  const parts = header.split(".");
  if (parts.length !== 4 || parts[0] !== "v1" || parts[1] !== vector.kid) return invalid;
  const supplied = Buffer.from(parts[3], "base64url");
  const expected = createHmac("sha256", Buffer.from(vector.secretHex, "hex"))
    .update(parts.slice(0, 3).join("."), "ascii").digest();
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return invalid;
  if (method !== vector.claims.mth || path !== vector.claims.pth
    || correlationId !== vector.claims.cid || now > Number(vector.claims.exp) + 5) return invalid;
  const nonceKey = `${vector.kid}:${vector.claims.nonce}`;
  if (state.nonces.has(nonceKey)) return invalid;
  if (state.nonces.size >= state.capacity) {
    return { status: 503, code: "SUBJECT_ASSERTION_CAPACITY_EXHAUSTED" };
  }
  state.nonces.add(nonceKey);
  return { status: 200, code: "OK" };
}
