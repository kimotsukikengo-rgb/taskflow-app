import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, MessageSquare, Paperclip, GripVertical } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import type { Task } from '../../types';
import { Avatar, StatusBadge, PriorityBadge } from '../ui';
import { CountdownTimer } from './CountdownTimer';
import { useUserStore, useProjectStore } from '../../store';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  showProject?: boolean;
  showCountdown?: boolean;
  draggable?: boolean;
}

export function TaskCard({
  task,
  onClick,
  showProject = true,
  showCountdown = true,
  draggable = false,
}: TaskCardProps) {
  const { getUserById } = useUserStore();
  const { getProjectById } = useProjectStore();
  const assignee = getUserById(task.assigneeId);
  const project = showProject && task.projectId ? getProjectById(task.projectId) : null;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    disabled: !draggable,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`card p-4 cursor-pointer hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-50 shadow-lg' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        {draggable && (
          <button
            {...attributes}
            {...listeners}
            className="mt-1 p-1 -ml-2 text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="w-4 h-4" />
          </button>
        )}

        <div className="flex-1 min-w-0">
          {/* Project Badge */}
          {project && (
            <div className="flex items-center gap-2 mb-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: project.color }}
              />
              <span className="text-xs text-slate-500 truncate">{project.title}</span>
            </div>
          )}

          {/* Title & Priority */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-medium text-slate-900 line-clamp-2">
              {task.title}
            </h3>
            <PriorityBadge priority={task.priority} />
          </div>

          {/* Next Action */}
          {task.nextAction && (
            <p className="mt-1 text-xs text-slate-500 line-clamp-1">
              次: {task.nextAction}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3 text-xs text-slate-500">
              {/* Due Date */}
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{format(parseISO(task.dueDate), 'M/d', { locale: ja })}</span>
              </div>

              {/* Tags count */}
              {task.tags && task.tags.length > 0 && (
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{task.tags.length}</span>
                </div>
              )}

              {/* Attachments count */}
              {task.attachments && task.attachments.length > 0 && (
                <div className="flex items-center gap-1">
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>{task.attachments.length}</span>
                </div>
              )}
            </div>

            {/* Assignee */}
            <Avatar user={assignee} size="sm" />
          </div>

          {/* Countdown Timer */}
          {showCountdown && task.status !== 'completed' && task.status !== 'on_hold' && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <CountdownTimer dueDate={task.dueDate} size="sm" />
            </div>
          )}

          {/* Status Badge */}
          <div className="mt-3">
            <StatusBadge status={task.status} />
          </div>
        </div>
      </div>
    </div>
  );
}
