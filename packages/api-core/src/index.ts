export type ErrorEnvelope = {
  code: string;
  message: string;
  correlationId: string;
  timestamp: string;
  details?: Record<string, unknown>;
};

export type HealthResponse = {
  service: string;
  status: "UP" | "DOWN";
  timestamp: string;
};

export function jsonHealth(service: string): HealthResponse {
  return {
    service,
    status: "UP",
    timestamp: new Date().toISOString()
  };
}

export function createErrorEnvelope(input: {
  code: string;
  message: string;
  correlationId: string;
  details?: Record<string, unknown>;
}): ErrorEnvelope {
  return {
    ...input,
    timestamp: new Date().toISOString()
  };
}
