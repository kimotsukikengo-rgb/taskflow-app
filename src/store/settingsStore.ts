import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppSettings, NotificationSettings, KanbanColumn } from '../types';

interface SettingsState {
  appSettings: AppSettings;
  notificationSettings: NotificationSettings;
  kanbanColumns: KanbanColumn[];

  // アプリ設定
  updateAppSettings: (settings: Partial<AppSettings>) => void;
  setView: (view: 'my' | 'team') => void;

  // 通知設定
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;

  // かんばんカラム設定
  updateKanbanColumn: (id: string, updates: Partial<KanbanColumn>) => void;
}

const defaultAppSettings: AppSettings = {
  currentUserId: '',
  theme: 'light',
  view: 'my',
  defaultFilter: {
    assigneeId: 'all',
    projectId: 'all',
    status: 'all',
    priority: 'all',
    period: 'all',
  },
  progressWeightBy: 'time',
  holdPausesDeadline: true,
};

const defaultNotificationSettings: NotificationSettings = {
  userId: '',
  dueReminderDays: 1,
  enableOverdueAlert: true,
  enableReviewStaleAlert: true,
  reviewStaleHours: 24,
  countdownEnabled: true,
  countdownGranularity: 'minutes',
};

const defaultKanbanColumns: KanbanColumn[] = [
  { id: 'pending', title: '未着手', color: '#64748b', wipLimit: undefined },
  { id: 'in_progress', title: '進行中', color: '#3b82f6', wipLimit: 5 },
  { id: 'review', title: 'レビュー待ち', color: '#f59e0b', wipLimit: 3 },
  { id: 'completed', title: '完了', color: '#22c55e', wipLimit: undefined },
  { id: 'on_hold', title: '保留', color: '#94a3b8', wipLimit: undefined },
];

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      appSettings: defaultAppSettings,
      notificationSettings: defaultNotificationSettings,
      kanbanColumns: defaultKanbanColumns,

      updateAppSettings: (settings) => {
        set((state) => ({
          appSettings: { ...state.appSettings, ...settings },
        }));
      },

      setView: (view) => {
        set((state) => ({
          appSettings: { ...state.appSettings, view },
        }));
      },

      updateNotificationSettings: (settings) => {
        set((state) => ({
          notificationSettings: { ...state.notificationSettings, ...settings },
        }));
      },

      updateKanbanColumn: (id, updates) => {
        set((state) => ({
          kanbanColumns: state.kanbanColumns.map((col) =>
            col.id === id ? { ...col, ...updates } : col
          ),
        }));
      },
    }),
    {
      name: 'settings-storage',
    }
  )
);
