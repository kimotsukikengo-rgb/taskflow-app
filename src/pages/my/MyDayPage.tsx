import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { AlertCircle, Clock, CheckCircle, Hourglass } from 'lucide-react';
import { Layout } from '../../components/layout';
import { TaskCard, TaskModal, DailyProgressChart } from '../../components/task';
import type { TaskFormData } from '../../components/task';
import type { Task } from '../../types';
import { useTaskStore, useUserStore } from '../../store';

export function MyDayPage() {
  const { tasks, addTask, updateTask, getMyDayTasks } = useTaskStore();
  const { getCurrentUser } = useUserStore();
  const currentUser = getCurrentUser();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();

  const myDayTasks = useMemo(() => {
    if (!currentUser) return { todayDue: [], overdue: [], todayWork: [], waiting: [] };
    return getMyDayTasks(currentUser.id);
  }, [currentUser, tasks, getMyDayTasks]);

  // 今日が対象のタスク（円グラフ用）
  const todayTasks = useMemo(() => {
    return [...myDayTasks.todayDue, ...myDayTasks.todayWork, ...myDayTasks.overdue];
  }, [myDayTasks]);

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

  const sections = [
    {
      id: 'overdue',
      title: '期限超過',
      icon: AlertCircle,
      iconColor: 'text-danger-500',
      bgColor: 'bg-danger-50',
      tasks: myDayTasks.overdue,
      emptyText: '期限超過のタスクはありません',
    },
    {
      id: 'today',
      title: '今日締切',
      icon: Clock,
      iconColor: 'text-warning-500',
      bgColor: 'bg-warning-50',
      tasks: myDayTasks.todayDue,
      emptyText: '今日締切のタスクはありません',
    },
    {
      id: 'inProgress',
      title: '進行中',
      icon: Hourglass,
      iconColor: 'text-primary-500',
      bgColor: 'bg-primary-50',
      tasks: myDayTasks.todayWork,
      emptyText: '進行中のタスクはありません',
    },
    {
      id: 'waiting',
      title: 'レビュー待ち',
      icon: CheckCircle,
      iconColor: 'text-slate-500',
      bgColor: 'bg-slate-100',
      tasks: myDayTasks.waiting,
      emptyText: 'レビュー待ちのタスクはありません',
    },
  ];

  if (!currentUser) {
    return (
      <Layout title="My Day">
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-500">ユーザーを選択してください</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="My Day" onAddTask={handleAddTask}>
      {/* Header with date */}
      <div className="mb-6">
        <p className="text-sm text-slate-500">
          {format(new Date(), 'yyyy年M月d日（EEEE）', { locale: ja })}
        </p>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">
          こんにちは、{currentUser.name}さん
        </h1>
      </div>

      {/* Progress Chart */}
      <DailyProgressChart tasks={todayTasks} className="mb-6" />

      {/* Task Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sections.map((section) => (
          <div key={section.id} className="card overflow-hidden">
            {/* Section Header */}
            <div className={`px-4 py-3 flex items-center gap-2 ${section.bgColor}`}>
              <section.icon className={`w-5 h-5 ${section.iconColor}`} />
              <h2 className="font-medium text-slate-900">{section.title}</h2>
              <span className="ml-auto text-sm text-slate-500">
                {section.tasks.length}件
              </span>
            </div>

            {/* Task List */}
            <div className="p-4 space-y-3 max-h-80 overflow-y-auto scrollbar-thin">
              {section.tasks.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">
                  {section.emptyText}
                </p>
              ) : (
                section.tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => handleEditTask(task)}
                    showProject
                    showCountdown={section.id !== 'waiting'}
                  />
                ))
              )}
            </div>
          </div>
        ))}
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
