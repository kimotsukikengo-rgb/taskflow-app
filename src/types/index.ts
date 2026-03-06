// 基本ID型
export type ID = string;

// タスクの状態
export type TaskStatus =
  | 'pending'      // 未着手
  | 'in_progress'  // 進行中
  | 'review'       // レビュー待ち
  | 'completed'    // 完了
  | 'on_hold';     // 保留

// 優先度
export type Priority = 'high' | 'medium' | 'low';

// ユーザー（チームメンバー）
export interface User {
  id: ID;
  name: string;
  email: string;
  avatar?: string;
  color: string; // アバター背景色
}

// 目標（最上位階層）
export interface Goal {
  id: ID;
  title: string;
  description?: string;
  targetDate?: string; // ISO date string
  progress: number; // 0-100
  createdAt: string;
  updatedAt: string;
}

// プロジェクト（目標の下）
export interface Project {
  id: ID;
  goalId?: ID;
  title: string;
  description?: string;
  color: string;
  startDate?: string;
  endDate?: string;
  ownerId: ID;
  memberIds: ID[];
  createdAt: string;
  updatedAt: string;
}

// プロセス（定型工程テンプレート）
export interface Process {
  id: ID;
  projectId: ID;
  title: string;
  description?: string;
  order: number;
  templateTasks?: TaskTemplate[];
  createdAt: string;
  updatedAt: string;
}

// タスクテンプレート（プロセス用）
export interface TaskTemplate {
  id: ID;
  title: string;
  description?: string;
  estimatedMinutes?: number;
  priority: Priority;
  order: number;
}

// タスク（実行単位）
export interface Task {
  id: ID;
  projectId: ID;
  processId?: ID;

  // 必須項目
  title: string;
  assigneeId: ID;           // 担当者（1タスク=1責任者）
  dueDate: string;          // 期日（ISO date string）
  status: TaskStatus;
  priority: Priority;
  nextAction?: string;      // 次アクション

  // 任意項目
  description?: string;
  startDate?: string;       // 開始日
  estimatedMinutes?: number; // 見積時間（分）
  actualMinutes?: number;   // 実績時間（分）
  dependsOn?: ID[];         // 依存関係（前提タスク）
  collaboratorIds?: ID[];   // 協力者
  watcherIds?: ID[];        // ウォッチャー
  tags?: string[];
  attachments?: Attachment[];

  // 保留関連
  holdReason?: string;      // 保留理由
  holdDate?: string;        // 保留開始日

  // メタ情報
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  order: number;            // かんばんでの並び順
}

// 添付ファイル
export interface Attachment {
  id: ID;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
}

// タスクフィルター
export interface TaskFilter {
  assigneeId?: ID | 'all';
  projectId?: ID | 'all';
  status?: TaskStatus | 'all';
  priority?: Priority | 'all';
  period?: 'today' | 'this_week' | 'this_month' | 'all';
  search?: string;
}

// My Day用のタスク分類
export interface MyDayTasks {
  todayDue: Task[];      // 今日締切
  overdue: Task[];       // 期限超過
  todayWork: Task[];     // 今日やる（明示的に設定）
  waiting: Task[];       // レビュー待ち
}

// 通知
export interface Notification {
  id: ID;
  type: 'due_reminder' | 'overdue' | 'review_stale' | 'mention' | 'assignment';
  taskId: ID;
  userId: ID;
  message: string;
  read: boolean;
  createdAt: string;
}

// 通知設定
export interface NotificationSettings {
  userId: ID;
  dueReminderDays: number;     // 期日の何日前に通知（デフォルト1）
  enableOverdueAlert: boolean;
  enableReviewStaleAlert: boolean;
  reviewStaleHours: number;    // レビュー待ちが何時間で滞留と見なすか
  countdownEnabled: boolean;   // カウントダウン表示
  countdownGranularity: 'seconds' | 'minutes'; // 表示粒度
}

// アプリ設定
export interface AppSettings {
  currentUserId: ID;
  theme: 'light' | 'dark' | 'system';
  view: 'my' | 'team';
  defaultFilter: TaskFilter;
  progressWeightBy: 'time' | 'points' | 'both'; // 円グラフの重み付け
  holdPausesDeadline: boolean; // 保留中は期限カウントを止めるか
}

// かんばんカラム設定
export interface KanbanColumn {
  id: TaskStatus;
  title: string;
  wipLimit?: number; // WIP制限
  color: string;
}

// ガントチャート用のタスク表示データ
export interface GanttTask extends Task {
  progress: number; // 0-100
  children?: GanttTask[];
}

// 週次チェックイン用データ
export interface WeeklyCheckin {
  weekStart: string;
  userId: ID;
  overdueCount: number;
  blockedTasks: Task[];
  topPriorities: Task[]; // 今週の優先Top3
  completedCount: number;
  totalCount: number;
}
