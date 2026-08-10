import { RateDetailView } from "./RateDetailView";

export default async function RateDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ rateId: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const [{ rateId }, query] = await Promise.all([params, searchParams]);
  return <RateDetailView rateId={rateId} editMode={query.mode === "edit"} />;
}
