import { ActivityDetail } from "@/components/modules/activity-details";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ActivityDetail kind="tasks" id={id} />;
}
