import { createCorrelationId } from "@erp/auth";
import type { SafeCorrelationId } from "./types";

export const CORRELATION_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;

export function resolveCorrelationId(value: string | null | undefined): SafeCorrelationId {
  return (value && CORRELATION_PATTERN.test(value)
    ? value
    : createCorrelationId()) as SafeCorrelationId;
}
