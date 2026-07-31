import type { PermitLease } from "./fair-semaphore";

let draining = false;
const activeControllers = new Set<AbortController>();
let signalInstalled = false;

export function isChargeDraining(): boolean {
  return draining;
}

export function beginChargeDrain(): void {
  draining = true;
  for (const controller of activeControllers) controller.abort();
}

export function trackedAbortController(): AbortController {
  installSignalHandler();
  const controller = new AbortController();
  activeControllers.add(controller);
  controller.signal.addEventListener("abort", () => activeControllers.delete(controller), { once: true });
  return controller;
}

export function finishTrackedController(controller: AbortController): void {
  activeControllers.delete(controller);
}

export function linkAbortSignal(source: AbortSignal, target: AbortController): () => void {
  const abort = () => target.abort(source.reason);
  if (source.aborted) abort();
  else source.addEventListener("abort", abort, { once: true });
  return () => source.removeEventListener("abort", abort);
}

/**
 * The permit follows the browser-facing response, not merely the upstream fetch.
 * It is released once on EOF, cancel, stream failure, or the bounded egress timer.
 */
export function responseWithPermit(
  response: Response,
  lease: PermitLease,
  egressDeadlineMs: number,
  abort: () => void
): Response {
  if (!response.body) {
    abort();
    lease.release();
    return response;
  }
  const reader = response.body.getReader();
  let closed = false;
  const finish = () => {
    if (closed) return;
    closed = true;
    clearTimeout(timer);
    abort();
    lease.release();
    reader.releaseLock();
  };
  const timer = setTimeout(async () => {
    try {
      await reader.cancel("egress deadline");
    } finally {
      finish();
    }
  }, egressDeadlineMs);
  const body = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const chunk = await reader.read();
        if (chunk.done) {
          controller.close();
          finish();
        } else {
          controller.enqueue(chunk.value);
        }
      } catch (error) {
        controller.error(error);
        finish();
      }
    },
    async cancel(reason) {
      try {
        await reader.cancel(reason);
      } finally {
        finish();
      }
    }
  });
  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers
  });
}

export function resetChargeLifecycleForTests(): void {
  draining = false;
  activeControllers.clear();
}

function installSignalHandler(): void {
  if (signalInstalled || typeof process === "undefined" || typeof process.once !== "function") return;
  signalInstalled = true;
  process.once("SIGTERM", beginChargeDrain);
}
