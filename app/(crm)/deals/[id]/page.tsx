import { DealDetail } from "@/components/modules/record-details";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DealDetail id={id} />;
}
