export function ensureCorrelationId(value: string | null | undefined): string {
  return value && isSafeCorrelationId(value) ? value : crypto.randomUUID();
}

export function isSafeCorrelationId(value: string | null | undefined): value is string {
  return typeof value === "string" && /^[A-Za-z0-9._:-]{8,128}$/.test(value);
}

export type StructuredLogInput = {
  level: "debug" | "info" | "warn" | "error";
  service: string;
  environment: string;
  operation: string;
  correlationId: string;
  message: string;
  result?: string;
  errorCode?: string;
  fields?: Record<string, unknown>;
};

const sensitiveKeyPattern = /password|token|secret|credential|authorization|cookie|claim/i;

export function structuredLog(input: StructuredLogInput) {
  return {
    timestamp: new Date().toISOString(),
    level: input.level,
    service: input.service,
    environment: input.environment,
    operation: input.operation,
    correlationId: ensureCorrelationId(input.correlationId),
    message: input.message,
    result: input.result ?? "unknown",
    errorCode: input.errorCode,
    fields: maskSensitiveFields(input.fields ?? {})
  };
}

export function maskSensitiveFields(fields: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [
      key,
      sensitiveKeyPattern.test(key) ? "[redacted]" : value
    ])
  );
}
