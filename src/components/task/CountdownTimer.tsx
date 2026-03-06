import { Clock, AlertTriangle } from 'lucide-react';
import { useCountdown } from '../../hooks/useCountdown';
import { useSettingsStore } from '../../store';

interface CountdownTimerProps {
  dueDate: string;
  showRing?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function CountdownTimer({ dueDate, showRing = false, size = 'md', className = '' }: CountdownTimerProps) {
  const { notificationSettings } = useSettingsStore();
  const { displayText, isOverdue, isUrgent, isWarning, totalSeconds } = useCountdown(
    dueDate,
    notificationSettings.countdownGranularity,
    notificationSettings.countdownEnabled
  );

  if (!notificationSettings.countdownEnabled) {
    return null;
  }

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const ringSize = {
    sm: 24,
    md: 32,
    lg: 40,
  };

  // 状態に応じたスタイルクラス
  const stateClass = isOverdue
    ? 'countdown-urgent'
    : isUrgent
    ? 'countdown-urgent'
    : isWarning
    ? 'countdown-warning'
    : 'countdown-normal';

  // 残り時間の割合（0-100）を計算（24時間を基準）
  const progress = isOverdue
    ? 0
    : Math.max(0, Math.min(100, (totalSeconds / 86400) * 100));

  return (
    <div className={`flex items-center gap-1.5 ${sizeClasses[size]} ${stateClass} ${className}`}>
      {showRing ? (
        <div className="relative" style={{ width: ringSize[size], height: ringSize[size] }}>
          <svg
            width={ringSize[size]}
            height={ringSize[size]}
            className="-rotate-90"
          >
            <circle
              cx={ringSize[size] / 2}
              cy={ringSize[size] / 2}
              r={(ringSize[size] - 4) / 2}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="text-slate-200"
            />
            <circle
              cx={ringSize[size] / 2}
              cy={ringSize[size] / 2}
              r={(ringSize[size] - 4) / 2}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeDasharray={Math.PI * (ringSize[size] - 4)}
              strokeDashoffset={Math.PI * (ringSize[size] - 4) * (1 - progress / 100)}
              strokeLinecap="round"
              className="countdown-ring"
            />
          </svg>
          {isOverdue && (
            <AlertTriangle
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              size={ringSize[size] * 0.5}
            />
          )}
        </div>
      ) : (
        isOverdue ? (
          <AlertTriangle className="w-4 h-4" />
        ) : (
          <Clock className="w-4 h-4" />
        )
      )}
      <span className="font-medium">{displayText}</span>
    </div>
  );
}
