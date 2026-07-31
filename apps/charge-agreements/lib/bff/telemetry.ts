export type ChargeTelemetryEvent = Readonly<{
  app: "apps-charge-agreements";
  routeId: string;
  operation: "read" | "mutation" | "reference";
  outcome: "success" | "denied" | "invalid" | "throttled" | "failed";
  statusClass: "2xx" | "4xx" | "5xx";
  correlationId: string;
  elapsedMs: number;
  permitWaitMs: number;
  requestBytes: number;
  responseBytes: number;
}>;

export function chargeTelemetry(input: Omit<ChargeTelemetryEvent, "app">): ChargeTelemetryEvent {
  return Object.freeze({
    app: "apps-charge-agreements",
    routeId: boundedDimension(input.routeId),
    operation: input.operation,
    outcome: input.outcome,
    statusClass: input.statusClass,
    correlationId: input.correlationId.slice(0, 128),
    elapsedMs: finite(input.elapsedMs),
    permitWaitMs: finite(input.permitWaitMs),
    requestBytes: finite(input.requestBytes),
    responseBytes: finite(input.responseBytes)
  });
}

function boundedDimension(value: string): string {
  return /^[a-z0-9][a-z0-9.-]{0,79}$/.test(value) ? value : "unknown";
}

function finite(value: number): number {
  return Number.isFinite(value) && value >= 0 ? Math.round(value * 100) / 100 : 0;
}
