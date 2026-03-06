import { useState, useEffect, useMemo } from 'react';
import { differenceInSeconds, parseISO, isPast } from 'date-fns';

interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isOverdue: boolean;
  isUrgent: boolean; // 残り24時間以内
  isWarning: boolean; // 残り72時間以内
  displayText: string;
}

export function useCountdown(
  targetDate: string,
  granularity: 'seconds' | 'minutes' = 'minutes',
  enabled: boolean = true
): CountdownResult {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(
      () => setNow(new Date()),
      granularity === 'seconds' ? 1000 : 60000
    );

    return () => clearInterval(interval);
  }, [granularity, enabled]);

  return useMemo(() => {
    const target = parseISO(targetDate);
    const totalSeconds = differenceInSeconds(target, now);
    const isOverdue = isPast(target);

    const absSeconds = Math.abs(totalSeconds);
    const days = Math.floor(absSeconds / 86400);
    const hours = Math.floor((absSeconds % 86400) / 3600);
    const minutes = Math.floor((absSeconds % 3600) / 60);
    const seconds = absSeconds % 60;

    const isUrgent = !isOverdue && totalSeconds <= 86400; // 24時間以内
    const isWarning = !isOverdue && totalSeconds <= 259200; // 72時間以内

    let displayText: string;
    if (isOverdue) {
      if (days > 0) {
        displayText = `${days}日超過`;
      } else if (hours > 0) {
        displayText = `${hours}時間超過`;
      } else {
        displayText = `${minutes}分超過`;
      }
    } else {
      if (days > 0) {
        displayText = `残り${days}日${hours}時間`;
      } else if (hours > 0) {
        displayText = `残り${hours}時間${minutes}分`;
      } else if (granularity === 'seconds') {
        displayText = `残り${minutes}分${seconds}秒`;
      } else {
        displayText = `残り${minutes}分`;
      }
    }

    return {
      days,
      hours,
      minutes,
      seconds,
      totalSeconds,
      isOverdue,
      isUrgent,
      isWarning,
      displayText,
    };
  }, [targetDate, now, granularity]);
}
