import { Bell, Search, Plus } from 'lucide-react';
import { Button, Avatar } from '../ui';
import { useUserStore, useNotificationStore } from '../../store';

interface HeaderProps {
  title: string;
  onAddTask?: () => void;
}

export function Header({ title, onAddTask }: HeaderProps) {
  const { getCurrentUser } = useUserStore();
  const { getUnreadCount } = useNotificationStore();
  const currentUser = getCurrentUser();
  const unreadCount = currentUser ? getUnreadCount(currentUser.id) : 0;

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="検索..."
            className="pl-9 pr-4 py-2 w-64 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Add Task Button */}
        {onAddTask && (
          <Button onClick={onAddTask} size="sm" className="gap-1">
            <Plus className="w-4 h-4" />
            タスク追加
          </Button>
        )}

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <Bell className="w-5 h-5 text-slate-600" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-danger-500 text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User Avatar */}
        <Avatar user={currentUser} size="md" />
      </div>
    </header>
  );
}
