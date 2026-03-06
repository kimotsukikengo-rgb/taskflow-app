import { useState, useMemo } from 'react';
import { Layout } from '../../components/layout';
import { TaskCard, TaskModal } from '../../components/task';
import type { TaskFormData } from '../../components/task';
import { Avatar, ProgressRing } from '../../components/ui';
import type { Task } from '../../types';
import { useTaskStore, useUserStore } from '../../store';

export function TeamMembersPage() {
  const { tasks, addTask, updateTask, getTasksByAssignee } = useTaskStore();
  const { users } = useUserStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  // ユーザーごとの統計
  const userStats = useMemo(() => {
    return users.map((user) => {
      const userTasks = getTasksByAssignee(user.id);
      const completed = userTasks.filter((t) => t.status === 'completed').length;
      const inProgress = userTasks.filter((t) => t.status === 'in_progress').length;
      const overdue = userTasks.filter((t) => {
        if (t.status === 'completed' || t.status === 'on_hold') return false;
        return new Date(t.dueDate) < new Date();
      }).length;

      return {
        user,
        total: userTasks.length,
        completed,
        inProgress,
        overdue,
        progress: userTasks.length > 0 ? (completed / userTasks.length) * 100 : 0,
        tasks: userTasks,
      };
    });
  }, [users, tasks, getTasksByAssignee]);

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

  return (
    <Layout title="メンバー別" onAddTask={handleAddTask}>
      <div className="space-y-4">
        {userStats.map(({ user, total, completed, inProgress, overdue, progress, tasks: userTasks }) => (
          <div key={user.id} className="card">
            {/* User Header */}
            <div
              className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
            >
              <div className="flex items-center gap-4">
                <Avatar user={user} size="lg" />
                <div>
                  <h3 className="font-medium text-slate-900">{user.name}</h3>
                  <p className="text-sm text-slate-500">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-8">
                {/* Stats */}
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="text-slate-500">合計</p>
                    <p className="font-semibold text-slate-900">{total}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-500">進行中</p>
                    <p className="font-semibold text-primary-600">{inProgress}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-500">完了</p>
                    <p className="font-semibold text-success-600">{completed}</p>
                  </div>
                  {overdue > 0 && (
                    <div className="text-center">
                      <p className="text-slate-500">遅延</p>
                      <p className="font-semibold text-danger-600">{overdue}</p>
                    </div>
                  )}
                </div>

                {/* Progress Ring */}
                <ProgressRing
                  progress={progress}
                  size={48}
                  color={progress >= 80 ? 'success' : progress >= 50 ? 'primary' : 'warning'}
                />
              </div>
            </div>

            {/* Expanded Tasks */}
            {expandedUser === user.id && (
              <div className="border-t border-slate-200 px-6 py-4">
                {userTasks.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">
                    タスクがありません
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {userTasks
                      .filter((t) => t.status !== 'completed')
                      .slice(0, 6)
                      .map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onClick={() => handleEditTask(task)}
                          showProject
                          showCountdown
                        />
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {users.length === 0 && (
          <div className="card p-12 text-center">
            <p className="text-slate-400">メンバーを追加してください</p>
          </div>
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
