import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Task, TaskStatus, TaskFilter, MyDayTasks } from '../types';
import { isToday, isPast, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO, isWithinInterval } from 'date-fns';

interface TaskState {
  tasks: Task[];
  filter: TaskFilter;

  // CRUD操作
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  // 状態変更
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  reorderTask: (id: string, newOrder: number) => void;

  // フィルター
  setFilter: (filter: Partial<TaskFilter>) => void;
  resetFilter: () => void;

  // 取得
  getFilteredTasks: () => Task[];
  getMyDayTasks: (userId: string) => MyDayTasks;
  getTasksByStatus: (status: TaskStatus) => Task[];
  getTasksByAssignee: (userId: string) => Task[];
  getTaskById: (id: string) => Task | undefined;
  getOverdueTasks: () => Task[];
  getTasksDueToday: () => Task[];
}

const defaultFilter: TaskFilter = {
  assigneeId: 'all',
  projectId: 'all',
  status: 'all',
  priority: 'all',
  period: 'all',
  search: '',
};

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      filter: defaultFilter,

      addTask: (taskData) => {
        const now = new Date().toISOString();
        const tasks = get().tasks;
        const maxOrder = tasks.length > 0 ? Math.max(...tasks.map(t => t.order)) : 0;

        const newTask: Task = {
          ...taskData,
          id: uuidv4(),
          createdAt: now,
          updatedAt: now,
          order: maxOrder + 1,
        };

        set((state) => ({
          tasks: [...state.tasks, newTask],
        }));

        return newTask;
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, ...updates, updatedAt: new Date().toISOString() }
              : task
          ),
        }));
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
      },

      updateTaskStatus: (id, status) => {
        const updates: Partial<Task> = { status };
        if (status === 'completed') {
          updates.completedAt = new Date().toISOString();
        }
        if (status === 'on_hold') {
          updates.holdDate = new Date().toISOString();
        }
        get().updateTask(id, updates);
      },

      reorderTask: (id, newOrder) => {
        set((state) => {
          const tasks = [...state.tasks];
          const taskIndex = tasks.findIndex(t => t.id === id);
          if (taskIndex === -1) return state;

          const task = tasks[taskIndex];
          const oldOrder = task.order;

          // 他のタスクの順序を調整
          tasks.forEach((t) => {
            if (t.id === id) {
              t.order = newOrder;
            } else if (newOrder > oldOrder && t.order > oldOrder && t.order <= newOrder) {
              t.order--;
            } else if (newOrder < oldOrder && t.order >= newOrder && t.order < oldOrder) {
              t.order++;
            }
          });

          return { tasks };
        });
      },

      setFilter: (filter) => {
        set((state) => ({
          filter: { ...state.filter, ...filter },
        }));
      },

      resetFilter: () => {
        set({ filter: defaultFilter });
      },

      getFilteredTasks: () => {
        const { tasks, filter } = get();
        let filtered = [...tasks];

        // 担当者フィルター
        if (filter.assigneeId && filter.assigneeId !== 'all') {
          filtered = filtered.filter((t) => t.assigneeId === filter.assigneeId);
        }

        // プロジェクトフィルター
        if (filter.projectId && filter.projectId !== 'all') {
          filtered = filtered.filter((t) => t.projectId === filter.projectId);
        }

        // 状態フィルター
        if (filter.status && filter.status !== 'all') {
          filtered = filtered.filter((t) => t.status === filter.status);
        }

        // 優先度フィルター
        if (filter.priority && filter.priority !== 'all') {
          filtered = filtered.filter((t) => t.priority === filter.priority);
        }

        // 期間フィルター
        if (filter.period && filter.period !== 'all') {
          const now = new Date();
          let start: Date;
          let end: Date;

          switch (filter.period) {
            case 'today':
              start = startOfDay(now);
              end = endOfDay(now);
              break;
            case 'this_week':
              start = startOfWeek(now, { weekStartsOn: 1 });
              end = endOfWeek(now, { weekStartsOn: 1 });
              break;
            case 'this_month':
              start = startOfMonth(now);
              end = endOfMonth(now);
              break;
            default:
              start = new Date(0);
              end = new Date(8640000000000000);
          }

          filtered = filtered.filter((t) => {
            const dueDate = parseISO(t.dueDate);
            return isWithinInterval(dueDate, { start, end });
          });
        }

        // 検索フィルター
        if (filter.search) {
          const searchLower = filter.search.toLowerCase();
          filtered = filtered.filter(
            (t) =>
              t.title.toLowerCase().includes(searchLower) ||
              t.description?.toLowerCase().includes(searchLower) ||
              t.tags?.some((tag) => tag.toLowerCase().includes(searchLower))
          );
        }

        // 並び順（order）でソート
        return filtered.sort((a, b) => a.order - b.order);
      },

      getMyDayTasks: (userId) => {
        const tasks = get().tasks.filter(
          (t) => t.assigneeId === userId && t.status !== 'completed'
        );

        const todayDue = tasks.filter((t) => {
          const dueDate = parseISO(t.dueDate);
          return isToday(dueDate) && t.status !== 'on_hold';
        });

        const overdue = tasks.filter((t) => {
          const dueDate = parseISO(t.dueDate);
          return isPast(endOfDay(dueDate)) && !isToday(dueDate) && t.status !== 'on_hold';
        });

        const waiting = tasks.filter((t) => t.status === 'review');

        // 今日やる = 進行中のタスク
        const todayWork = tasks.filter((t) => t.status === 'in_progress');

        return { todayDue, overdue, todayWork, waiting };
      },

      getTasksByStatus: (status) => {
        return get().tasks.filter((t) => t.status === status).sort((a, b) => a.order - b.order);
      },

      getTasksByAssignee: (userId) => {
        return get().tasks.filter((t) => t.assigneeId === userId).sort((a, b) => a.order - b.order);
      },

      getTaskById: (id) => {
        return get().tasks.find((t) => t.id === id);
      },

      getOverdueTasks: () => {
        return get().tasks.filter((t) => {
          if (t.status === 'completed' || t.status === 'on_hold') return false;
          const dueDate = parseISO(t.dueDate);
          return isPast(endOfDay(dueDate)) && !isToday(dueDate);
        });
      },

      getTasksDueToday: () => {
        return get().tasks.filter((t) => {
          if (t.status === 'completed') return false;
          const dueDate = parseISO(t.dueDate);
          return isToday(dueDate);
        });
      },
    }),
    {
      name: 'task-storage',
    }
  )
);
