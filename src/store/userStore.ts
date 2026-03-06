import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { User } from '../types';

// アバター背景色のプリセット
const AVATAR_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#8b5cf6', // violet
  '#f59e0b', // amber
  '#ef4444', // red
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
];

interface UserState {
  users: User[];
  currentUserId: string | null;

  // CRUD
  addUser: (user: Omit<User, 'id' | 'color'>) => User;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;

  // 現在のユーザー
  setCurrentUser: (id: string) => void;
  getCurrentUser: () => User | undefined;

  // 取得
  getUserById: (id: string) => User | undefined;
  getUsersByIds: (ids: string[]) => User[];
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      users: [],
      currentUserId: null,

      addUser: (userData) => {
        const users = get().users;
        const colorIndex = users.length % AVATAR_COLORS.length;

        const newUser: User = {
          ...userData,
          id: uuidv4(),
          color: AVATAR_COLORS[colorIndex],
        };

        set((state) => ({
          users: [...state.users, newUser],
        }));

        // 最初のユーザーを自動的に現在のユーザーに設定
        if (users.length === 0) {
          set({ currentUserId: newUser.id });
        }

        return newUser;
      },

      updateUser: (id, updates) => {
        set((state) => ({
          users: state.users.map((user) =>
            user.id === id ? { ...user, ...updates } : user
          ),
        }));
      },

      deleteUser: (id) => {
        set((state) => ({
          users: state.users.filter((user) => user.id !== id),
          currentUserId: state.currentUserId === id ? null : state.currentUserId,
        }));
      },

      setCurrentUser: (id) => {
        set({ currentUserId: id });
      },

      getCurrentUser: () => {
        const { users, currentUserId } = get();
        return users.find((u) => u.id === currentUserId);
      },

      getUserById: (id) => {
        return get().users.find((u) => u.id === id);
      },

      getUsersByIds: (ids) => {
        return get().users.filter((u) => ids.includes(u.id));
      },
    }),
    {
      name: 'user-storage',
    }
  )
);
