import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Project, Goal } from '../types';

// プロジェクトカラーのプリセット
const PROJECT_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#8b5cf6', // violet
  '#f59e0b', // amber
  '#ef4444', // red
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#6366f1', // indigo
  '#14b8a6', // teal
];

interface ProjectState {
  projects: Project[];
  goals: Goal[];

  // プロジェクトCRUD
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'color'>) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // 目標CRUD
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'progress'>) => Goal;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;

  // 取得
  getProjectById: (id: string) => Project | undefined;
  getProjectsByGoal: (goalId: string) => Project[];
  getGoalById: (id: string) => Goal | undefined;
  getProjectsByMember: (userId: string) => Project[];
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      goals: [],

      addProject: (projectData) => {
        const now = new Date().toISOString();
        const projects = get().projects;
        const colorIndex = projects.length % PROJECT_COLORS.length;

        const newProject: Project = {
          ...projectData,
          id: uuidv4(),
          color: PROJECT_COLORS[colorIndex],
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          projects: [...state.projects, newProject],
        }));

        return newProject;
      },

      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id
              ? { ...project, ...updates, updatedAt: new Date().toISOString() }
              : project
          ),
        }));
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((project) => project.id !== id),
        }));
      },

      addGoal: (goalData) => {
        const now = new Date().toISOString();

        const newGoal: Goal = {
          ...goalData,
          id: uuidv4(),
          progress: 0,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          goals: [...state.goals, newGoal],
        }));

        return newGoal;
      },

      updateGoal: (id, updates) => {
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === id
              ? { ...goal, ...updates, updatedAt: new Date().toISOString() }
              : goal
          ),
        }));
      },

      deleteGoal: (id) => {
        set((state) => ({
          goals: state.goals.filter((goal) => goal.id !== id),
        }));
      },

      getProjectById: (id) => {
        return get().projects.find((p) => p.id === id);
      },

      getProjectsByGoal: (goalId) => {
        return get().projects.filter((p) => p.goalId === goalId);
      },

      getGoalById: (id) => {
        return get().goals.find((g) => g.id === id);
      },

      getProjectsByMember: (userId) => {
        return get().projects.filter(
          (p) => p.ownerId === userId || p.memberIds.includes(userId)
        );
      },
    }),
    {
      name: 'project-storage',
    }
  )
);
