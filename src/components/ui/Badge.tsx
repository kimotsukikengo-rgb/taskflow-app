import type { TaskStatus, Priority } from '../../types';

interface StatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

const statusLabels: Record<TaskStatus, string> = {
  pending: '未着手',
  in_progress: '進行中',
  review: 'レビュー待ち',
  completed: '完了',
  on_hold: '保留',
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const statusClasses: Record<TaskStatus, string> = {
    pending: 'badge-pending',
    in_progress: 'badge-in-progress',
    review: 'badge-review',
    completed: 'badge-completed',
    on_hold: 'badge-on-hold',
  };

  return (
    <span className={`${statusClasses[status]} ${className}`}>
      {statusLabels[status]}
    </span>
  );
}

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

const priorityLabels: Record<Priority, string> = {
  high: '高',
  medium: '中',
  low: '低',
};

export function PriorityBadge({ priority, className = '' }: PriorityBadgeProps) {
  const priorityClasses: Record<Priority, string> = {
    high: 'badge bg-danger-50 text-danger-600',
    medium: 'badge bg-warning-50 text-warning-600',
    low: 'badge bg-slate-100 text-slate-600',
  };

  return (
    <span className={`${priorityClasses[priority]} ${className}`}>
      {priorityLabels[priority]}
    </span>
  );
}

interface TagBadgeProps {
  tag: string;
  onRemove?: () => void;
  className?: string;
}

export function TagBadge({ tag, onRemove, className = '' }: TagBadgeProps) {
  return (
    <span className={`badge bg-primary-50 text-primary-700 ${className}`}>
      {tag}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 hover:text-primary-900"
          aria-label={`Remove ${tag} tag`}
        >
          &times;
        </button>
      )}
    </span>
  );
}
