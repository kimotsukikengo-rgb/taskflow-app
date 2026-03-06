import { useMemo } from 'react';

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  className?: string;
  showPercentage?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'danger';
}

export function ProgressRing({
  progress,
  size = 60,
  strokeWidth = 4,
  className = '',
  showPercentage = true,
  color = 'primary',
}: ProgressRingProps) {
  const { radius, circumference, offset } = useMemo(() => {
    const r = (size - strokeWidth) / 2;
    const c = 2 * Math.PI * r;
    const o = c - (Math.min(100, Math.max(0, progress)) / 100) * c;
    return { radius: r, circumference: c, offset: o };
  }, [size, strokeWidth, progress]);

  const colorClasses = {
    primary: 'text-primary-500',
    success: 'text-success-500',
    warning: 'text-warning-500',
    danger: 'text-danger-500',
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-200"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`countdown-ring ${colorClasses[color]}`}
        />
      </svg>
      {showPercentage && (
        <span className="absolute text-sm font-medium text-slate-700">
          {Math.round(progress)}%
        </span>
      )}
    </div>
  );
}
