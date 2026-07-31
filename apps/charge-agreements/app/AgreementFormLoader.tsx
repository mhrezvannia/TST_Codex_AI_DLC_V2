"use client";

import { Card, Skeleton } from "@erp/ui";
import { useEffect, useState } from "react";
import { getAgreement } from "../lib/agreement-client";
import type { AgreementDetail } from "../lib/agreements";
import { AgreementFormEditor } from "./AgreementForm";

export function AgreementFormLoader({ agreementId, mode }: { agreementId: string; mode: "edit" | "successor" }) {
  const [detail, setDetail] = useState<AgreementDetail | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { void getAgreement(agreementId).then(setDetail).catch((reason) => setError(reason instanceof Error ? reason.message : "Agreement could not be loaded")); }, [agreementId]);
  if (error) return <Card title="Agreement unavailable"><p role="alert">{error}</p></Card>;
  if (!detail) return <Card><Skeleton height={240} /></Card>;
  return <Card><AgreementFormEditor detail={detail} mode={mode} /></Card>;
}
