import { ReportBuilder } from "@/components/modules/reports";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ReportBuilder id={id} />;
}
