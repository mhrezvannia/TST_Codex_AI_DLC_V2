import { deriveReplayKey } from "./replay-key";
import type { ClientRequestId } from "./types";

const requestId = "018f52c0-3c2e-7abc-8def-0123456789ab" as ClientRequestId;

describe("opaque replay-key derivation", () => {
  it("is deterministic and contains no protected inputs", () => {
    const input = { subjectId: "üser", routeId: "approve", targetId: "agr-1", requestId };
    const key = deriveReplayKey({ ...input, clientRequestId: input.requestId });
    expect(key).toBe(deriveReplayKey({ ...input, clientRequestId: input.requestId }));
    expect(key).not.toContain("üser");
  });

  it("separates framed values and route/version context", () => {
    const base = { subjectId: "ab", routeId: "c", clientRequestId: requestId };
    expect(deriveReplayKey(base)).not.toBe(deriveReplayKey({ ...base, subjectId: "a", routeId: "bc" }));
    expect(deriveReplayKey(base)).not.toBe(deriveReplayKey({ ...base, expectedVersion: 2 }));
  });
});
