import { useState, useMemo } from 'react';
import {
  format,
  startOfWeek,
  endOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  parseISO,
  differenceInDays,
  isWithinInterval,
  isSameDay,
} from 'date-fns';
import { ja } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Layout } from '../../components/layout';
import { TaskModal } from '../../components/task';
import type { TaskFormData } from '../../components/task';
import { Button, Avatar } from '../../components/ui';
import type { Task } from '../../types';
import { useTaskStore, useUserStore, useProjectStore } from '../../store';

export function TeamTimelinePage() {
  const { tasks, addTask, updateTask } = useTaskStore();
  const { users } = useUserStore();
  const { getProjectById } = useProjectStore();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();

  // 表示する週の範囲
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

  // 週の日付配列
  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(weekStart, i));
    }
    return days;
  }, [weekStart]);

  // この週に関連するタスクをフィルタ
  const weekTasks = useMemo(() => {
    return tasks.filter((task) => {
      const startDate = task.startDate ? parseISO(task.startDate) : parseISO(task.dueDate);
      const endDate = parseISO(task.dueDate);

      return (
        isWithinInterval(startDate, { start: weekStart, end: weekEnd }) ||
        isWithinInterval(endDate, { start: weekStart, end: weekEnd }) ||
        (startDate < weekStart && endDate > weekEnd)
      );
    });
  }, [tasks, weekStart, weekEnd]);

  // ユーザーごとにタスクをグループ化
  const tasksByUser = useMemo(() => {
    const grouped = new Map<string, Task[]>();
    users.forEach((user) => {
      grouped.set(
        user.id,
        weekTasks.filter((t) => t.assigneeId === user.id)
      );
    });
    return grouped;
  }, [users, weekTasks]);

  const handlePrevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const handleNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

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

  // タスクバーの位置を計算
  const getTaskBarStyle = (task: Task) => {
    const startDate = task.startDate ? parseISO(task.startDate) : parseISO(task.dueDate);
    const endDate = parseISO(task.dueDate);

    const barStart = Math.max(0, differenceInDays(startDate, weekStart));
    const barEnd = Math.min(6, differenceInDays(endDate, weekStart));
    const barWidth = barEnd - barStart + 1;

    const project = getProjectById(task.projectId);

    return {
      left: `${(barStart / 7) * 100}%`,
      width: `${(barWidth / 7) * 100}%`,
      backgroundColor: project?.color || '#3b82f6',
    };
  };

  return (
    <Layout title="タイムライン" onAddTask={handleAddTask}>
      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handlePrevWeek}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="secondary" size="sm" onClick={handleToday}>
            今日
          </Button>
          <Button variant="ghost" size="sm" onClick={handleNextWeek}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <span className="ml-4 font-medium text-slate-900">
            {format(weekStart, 'yyyy年M月d日', { locale: ja })} -{' '}
            {format(weekEnd, 'M月d日', { locale: ja })}
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div className="card overflow-hidden">
        {/* Header (Days) */}
        <div className="flex border-b border-slate-200">
          <div className="w-48 flex-shrink-0 px-4 py-3 bg-slate-50 border-r border-slate-200">
            <span className="text-sm font-medium text-slate-600">メンバー</span>
          </div>
          <div className="flex-1 flex">
            {weekDays.map((day) => {
              const isToday = isSameDay(day, new Date());
              return (
                <div
                  key={day.toISOString()}
                  className={`flex-1 px-2 py-3 text-center border-r border-slate-200 last:border-r-0 ${
                    isToday ? 'bg-primary-50' : 'bg-slate-50'
                  }`}
                >
                  <div className="text-xs text-slate-500">
                    {format(day, 'E', { locale: ja })}
                  </div>
                  <div
                    className={`text-sm font-medium ${
                      isToday ? 'text-primary-600' : 'text-slate-900'
                    }`}
                  >
                    {format(day, 'd')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rows (Users) */}
        {users.map((user) => {
          const userTasks = tasksByUser.get(user.id) || [];
          return (
            <div
              key={user.id}
              className="flex border-b border-slate-200 last:border-b-0"
            >
              {/* User Info */}
              <div className="w-48 flex-shrink-0 px-4 py-3 bg-slate-50 border-r border-slate-200 flex items-center gap-2">
                <Avatar user={user} size="sm" />
                <span className="text-sm font-medium text-slate-900 truncate">
                  {user.name}
                </span>
              </div>

              {/* Tasks */}
              <div className="flex-1 relative min-h-[80px]">
                {/* Grid lines */}
                <div className="absolute inset-0 flex">
                  {weekDays.map((day) => (
                    <div
                      key={day.toISOString()}
                      className={`flex-1 border-r border-slate-100 last:border-r-0 ${
                        isSameDay(day, new Date()) ? 'bg-primary-50/30' : ''
                      }`}
                    />
                  ))}
                </div>

                {/* Task Bars */}
                <div className="relative p-2 space-y-1">
                  {userTasks.map((task) => (
                    <div
                      key={task.id}
                      className="relative h-8 cursor-pointer group"
                      onClick={() => handleEditTask(task)}
                    >
                      <div
                        className="absolute top-0 h-full rounded-md flex items-center px-2 text-white text-xs font-medium truncate hover:opacity-90 transition-opacity"
                        style={getTaskBarStyle(task)}
                      >
                        {task.title}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        {users.length === 0 && (
          <div className="flex items-center justify-center h-32 text-sm text-slate-400">
            メンバーを追加してください
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
