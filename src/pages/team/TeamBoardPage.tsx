import { useState, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Layout } from '../../components/layout';
import { TaskCard, TaskModal } from '../../components/task';
import type { TaskFormData } from '../../components/task';
import type { Task, TaskStatus } from '../../types';
import { useTaskStore, useSettingsStore } from '../../store';

export function TeamBoardPage() {
  const { tasks, addTask, updateTask, updateTaskStatus, reorderTask } = useTaskStore();
  const { kanbanColumns } = useSettingsStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // ステータスごとにタスクをグループ化
  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      pending: [],
      in_progress: [],
      review: [],
      completed: [],
      on_hold: [],
    };

    tasks
      .sort((a, b) => a.order - b.order)
      .forEach((task) => {
        grouped[task.status].push(task);
      });

    return grouped;
  }, [tasks]);

  const handleAddTask = () => {
    setSelectedTask(undefined);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleSubmitTask = (data: TaskFormData) => {
    if (selectedTask) {
      updateTask(selectedTask.id, data);
    } else {
      addTask({
        ...data,
        tags: data.tags || [],
      });
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeTask = tasks.find((t) => t.id === active.id);
    if (!activeTask) return;

    // カラム（ステータス）へのドロップ
    const overColumn = kanbanColumns.find((col) => col.id === over.id);
    if (overColumn) {
      if (activeTask.status !== overColumn.id) {
        updateTaskStatus(activeTask.id, overColumn.id);
      }
      return;
    }

    // 別のタスクへのドロップ（同じカラム内での並び替え）
    const overTask = tasks.find((t) => t.id === over.id);
    if (overTask) {
      if (activeTask.status !== overTask.status) {
        updateTaskStatus(activeTask.id, overTask.status);
      }
      if (activeTask.order !== overTask.order) {
        reorderTask(activeTask.id, overTask.order);
      }
    }
  };

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;

  return (
    <Layout title="Team Board" onAddTask={handleAddTask}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {kanbanColumns.map((column) => {
            const columnTasks = tasksByStatus[column.id];
            const isOverWipLimit = column.wipLimit && columnTasks.length > column.wipLimit;

            return (
              <div
                key={column.id}
                className="flex-shrink-0 w-80"
              >
                {/* Column Header */}
                <div
                  className="flex items-center justify-between px-3 py-2 rounded-t-lg"
                  style={{ backgroundColor: column.color + '20' }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: column.color }}
                    />
                    <h3 className="font-medium text-slate-900">{column.title}</h3>
                    <span className="text-sm text-slate-500">
                      {columnTasks.length}
                    </span>
                  </div>
                  {column.wipLimit && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        isOverWipLimit
                          ? 'bg-danger-100 text-danger-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      WIP: {column.wipLimit}
                    </span>
                  )}
                </div>

                {/* Column Content */}
                <div
                  className="bg-slate-100 rounded-b-lg p-2 min-h-[500px]"
                >
                  <SortableContext
                    items={columnTasks.map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {columnTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onClick={() => handleEditTask(task)}
                          showProject
                          showCountdown={column.id !== 'completed' && column.id !== 'on_hold'}
                          draggable
                        />
                      ))}
                    </div>
                  </SortableContext>

                  {columnTasks.length === 0 && (
                    <div className="flex items-center justify-center h-32 text-sm text-slate-400">
                      タスクをドラッグしてください
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <DragOverlay>
          {activeTask && (
            <TaskCard
              task={activeTask}
              showProject
              showCountdown={false}
            />
          )}
        </DragOverlay>
      </DndContext>

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={selectedTask}
        onSubmit={handleSubmitTask}
      />
    </Layout>
  );
}
