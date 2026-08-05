export type PermitLease = Readonly<{
  waitedMs: number;
  release: () => void;
}>;

export class FairSemaphoreCapacityError extends Error {
  readonly code = "QUEUE_CAPACITY_EXHAUSTED";
  readonly maximumQueued: number;

  constructor(maximumQueued: number) {
    super("The bounded waiter queue is full");
    this.name = "FairSemaphoreCapacityError";
    this.maximumQueued = maximumQueued;
  }
}

type Waiter = {
  resolve: (lease: PermitLease | null) => void;
  timer: ReturnType<typeof setTimeout>;
  signal?: AbortSignal;
  abort?: () => void;
  enqueuedAt: number;
};

export class FairSemaphore {
  readonly capacity: number;
  readonly maximumQueued: number;
  #available: number;
  #waiters: Waiter[] = [];

  constructor(capacity: number, maximumQueued = capacity) {
    if (!Number.isInteger(capacity) || capacity < 1) throw new Error("capacity must be positive");
    if (!Number.isInteger(maximumQueued) || maximumQueued < 0) {
      throw new Error("maximumQueued must be a non-negative integer");
    }
    this.capacity = capacity;
    this.maximumQueued = maximumQueued;
    this.#available = capacity;
  }

  get active(): number {
    return this.capacity - this.#available;
  }

  get queued(): number {
    return this.#waiters.length;
  }

  async acquire(waitMs: number, signal?: AbortSignal): Promise<PermitLease | null> {
    if (signal?.aborted) return null;
    const enqueuedAt = performance.now();
    if (this.#available > 0 && this.#waiters.length === 0) {
      this.#available -= 1;
      return this.#lease(enqueuedAt);
    }
    if (this.#waiters.length >= this.maximumQueued) {
      throw new FairSemaphoreCapacityError(this.maximumQueued);
    }
    return new Promise((resolve) => {
      const waiter: Waiter = {
        resolve,
        enqueuedAt,
        signal,
        timer: setTimeout(() => this.#remove(waiter, null), waitMs)
      };
      if (signal) {
        waiter.abort = () => this.#remove(waiter, null);
        signal.addEventListener("abort", waiter.abort, { once: true });
      }
      this.#waiters.push(waiter);
    });
  }

  #lease(acquiredAt: number): PermitLease {
    let released = false;
    return Object.freeze({
      waitedMs: Math.max(0, performance.now() - acquiredAt),
      release: () => {
        if (released) return;
        released = true;
        this.#handoff();
      }
    });
  }

  #handoff(): void {
    const waiter = this.#waiters.shift();
    if (!waiter) {
      this.#available = Math.min(this.capacity, this.#available + 1);
      return;
    }
    clearTimeout(waiter.timer);
    if (waiter.signal && waiter.abort) waiter.signal.removeEventListener("abort", waiter.abort);
    waiter.resolve(this.#lease(waiter.enqueuedAt));
  }

  #remove(waiter: Waiter, value: PermitLease | null): void {
    const index = this.#waiters.indexOf(waiter);
    if (index < 0) return;
    this.#waiters.splice(index, 1);
    clearTimeout(waiter.timer);
    if (waiter.signal && waiter.abort) waiter.signal.removeEventListener("abort", waiter.abort);
    waiter.resolve(value);
  }
}
