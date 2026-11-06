import TaskDetail from "@/components/tasks/TaskDetail";

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TaskDetail taskId={Number(id)} />;
}
