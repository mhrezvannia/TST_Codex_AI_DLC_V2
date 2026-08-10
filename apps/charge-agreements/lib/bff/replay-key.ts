import { createHash } from "node:crypto";
import type { ClientRequestId, ReplayKey } from "./types";

export type ReplayKeyInput = Readonly<{
  subjectId: string;
  routeId: string;
  targetId?: string;
  expectedVersion?: string | number;
  clientRequestId: ClientRequestId;
}>;

/**
 * This is only an opaque retry key for policies that opt in. It is not durable
 * replay protection unless the selected downstream endpoint persists it.
 */
export function deriveReplayKey(input: ReplayKeyInput): ReplayKey {
  const record = [
    input.subjectId,
    input.routeId,
    input.targetId ?? "new",
    input.expectedVersion === undefined ? "new" : String(input.expectedVersion),
    input.clientRequestId
  ].map(frame).join("");
  const digest = createHash("sha256").update(record, "utf8").digest("hex");
  return `charge-ui:v1:${digest}` as ReplayKey;
}

function frame(value: string): string {
  return `${Buffer.byteLength(value, "utf8")}:${value}`;
}
