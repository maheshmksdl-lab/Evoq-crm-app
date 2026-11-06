import DealDetail from "@/components/deals/DealDetail";

export default async function DealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DealDetail dealId={parseInt(id)} />;
}
