import { useState, useMemo } from 'react';
import { Layout } from '../../components/layout';
import { TaskCard, TaskModal } from '../../components/task';
import type { TaskFormData } from '../../components/task';
import { Button, Select } from '../../components/ui';
import type { Task, TaskStatus, Priority } from '../../types';
import { useTaskStore, useUserStore, useProjectStore } from '../../store';

export function MyTasksPage() {
  const { tasks, addTask, updateTask, filter, setFilter, getFilteredTasks } = useTaskStore();
  const { getCurrentUser } = useUserStore();
  const { projects } = useProjectStore();
  const currentUser = getCurrentUser();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();

  // 自分のタスクのみをフィルタ
  const myTasks = useMemo(() => {
    if (!currentUser) return [];
    return getFilteredTasks().filter((t) => t.assigneeId === currentUser.id);
  }, [tasks, filter, currentUser, getFilteredTasks]);

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

  const statusOptions = [
    { value: 'all', label: 'すべての状態' },
    { value: 'pending', label: '未着手' },
    { value: 'in_progress', label: '進行中' },
    { value: 'review', label: 'レビュー待ち' },
    { value: 'completed', label: '完了' },
    { value: 'on_hold', label: '保留' },
  ];

  const priorityOptions = [
    { value: 'all', label: 'すべての優先度' },
    { value: 'high', label: '高' },
    { value: 'medium', label: '中' },
    { value: 'low', label: '低' },
  ];

  const periodOptions = [
    { value: 'all', label: 'すべての期間' },
    { value: 'today', label: '今日' },
    { value: 'this_week', label: '今週' },
    { value: 'this_month', label: '今月' },
  ];

  const projectOptions = [
    { value: 'all', label: 'すべてのプロジェクト' },
    ...projects.map((p) => ({ value: p.id, label: p.title })),
  ];

  if (!currentUser) {
    return (
      <Layout title="タスク一覧">
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-500">ユーザーを選択してください</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="タスク一覧" onAddTask={handleAddTask}>
      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Select
            value={filter.status || 'all'}
            onChange={(e) => setFilter({ status: e.target.value as TaskStatus | 'all' })}
            options={statusOptions}
          />
          <Select
            value={filter.priority || 'all'}
            onChange={(e) => setFilter({ priority: e.target.value as Priority | 'all' })}
            options={priorityOptions}
          />
          <Select
            value={filter.period || 'all'}
            onChange={(e) => setFilter({ period: e.target.value as 'today' | 'this_week' | 'this_month' | 'all' })}
            options={periodOptions}
          />
          <Select
            value={filter.projectId || 'all'}
            onChange={(e) => setFilter({ projectId: e.target.value })}
            options={projectOptions}
          />
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {myTasks.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-slate-400">タスクがありません</p>
            <Button className="mt-4" onClick={handleAddTask}>
              最初のタスクを作成
            </Button>
          </div>
        ) : (
          myTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => handleEditTask(task)}
              showProject
              showCountdown
            />
          ))
        )}
      </div>

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
