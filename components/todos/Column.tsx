import { ReactNode } from "react";
import { useDroppable } from "@dnd-kit/core";

interface ColumnProps {
  title: string;
  status: string;
  children: ReactNode;
}

export default function Column({ title, status, children }: ColumnProps) {
  const { setNodeRef } = useDroppable({ id: status });

  return (
    <div ref={setNodeRef} className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg min-h-[400px]">
      <h2 className="text-lg font-semibold mb-3 text-center">{title}</h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
