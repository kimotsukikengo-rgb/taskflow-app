import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { Task } from '../../types';
import { useSettingsStore } from '../../store';

interface DailyProgressChartProps {
  tasks: Task[];
  className?: string;
}

export function DailyProgressChart({ tasks, className = '' }: DailyProgressChartProps) {
  const { appSettings } = useSettingsStore();

  const { percentage, data } = useMemo(() => {
    // 重み付けに応じた合計を計算
    const calculateWeight = (task: Task): number => {
      switch (appSettings.progressWeightBy) {
        case 'time':
          return task.estimatedMinutes || 30; // デフォルト30分
        case 'points':
          // 優先度をポイントに変換
          const priorityPoints = { high: 3, medium: 2, low: 1 };
          return priorityPoints[task.priority];
        case 'both':
          const time = task.estimatedMinutes || 30;
          const points = { high: 3, medium: 2, low: 1 }[task.priority];
          return time * points;
        default:
          return 1;
      }
    };

    const completedTasks = tasks.filter((t) => t.status === 'completed');
    const incompleteTasks = tasks.filter((t) => t.status !== 'completed');

    const completedWeight = completedTasks.reduce((sum, t) => sum + calculateWeight(t), 0);
    const incompleteWeight = incompleteTasks.reduce((sum, t) => sum + calculateWeight(t), 0);
    const totalWeight = completedWeight + incompleteWeight;

    const pct = totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;

    return {
      completed: completedWeight,
      total: totalWeight,
      percentage: pct,
      data: [
        { name: '完了', value: completedWeight, color: '#22c55e' },
        { name: '未完了', value: incompleteWeight, color: '#e2e8f0' },
      ],
    };
  }, [tasks, appSettings.progressWeightBy]);

  return (
    <div className={`card p-6 ${className}`}>
      <h3 className="text-sm font-medium text-slate-500 mb-4">今日の進捗</h3>

      <div className="flex items-center gap-6">
        {/* Chart */}
        <div className="relative w-32 h-32">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={50}
                paddingAngle={2}
                startAngle={90}
                endAngle={-270}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-slate-900">{percentage}%</span>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-success-500" />
            <span className="text-sm text-slate-600">完了</span>
            <span className="text-sm font-medium text-slate-900">
              {tasks.filter((t) => t.status === 'completed').length}件
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-slate-200" />
            <span className="text-sm text-slate-600">残り</span>
            <span className="text-sm font-medium text-slate-900">
              {tasks.filter((t) => t.status !== 'completed').length}件
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {appSettings.progressWeightBy === 'time' && '見積時間で重み付け'}
            {appSettings.progressWeightBy === 'points' && '優先度で重み付け'}
            {appSettings.progressWeightBy === 'both' && '時間×優先度で重み付け'}
          </p>
        </div>
      </div>
    </div>
  );
}
