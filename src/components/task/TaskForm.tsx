import { useState } from 'react';
import { format } from 'date-fns';
import type { Task, TaskStatus, Priority } from '../../types';
import { Button, Input, Textarea, Select } from '../ui';
import { useUserStore, useProjectStore } from '../../store';

interface TaskFormProps {
  task?: Task;
  projectId?: string;
  onSubmit: (data: TaskFormData) => void;
  onCancel: () => void;
}

export interface TaskFormData {
  title: string;
  description?: string;
  assigneeId: string;
  projectId: string;
  dueDate: string;
  startDate?: string;
  status: TaskStatus;
  priority: Priority;
  nextAction?: string;
  estimatedMinutes?: number;
  tags?: string[];
}

const statusOptions = [
  { value: 'pending', label: '未着手' },
  { value: 'in_progress', label: '進行中' },
  { value: 'review', label: 'レビュー待ち' },
  { value: 'completed', label: '完了' },
  { value: 'on_hold', label: '保留' },
];

const priorityOptions = [
  { value: 'high', label: '高' },
  { value: 'medium', label: '中' },
  { value: 'low', label: '低' },
];

export function TaskForm({ task, projectId, onSubmit, onCancel }: TaskFormProps) {
  const { users } = useUserStore();
  const { projects } = useProjectStore();

  const [formData, setFormData] = useState<TaskFormData>({
    title: task?.title || '',
    description: task?.description || '',
    assigneeId: task?.assigneeId || users[0]?.id || '',
    projectId: task?.projectId || projectId || projects[0]?.id || '',
    dueDate: task?.dueDate || format(new Date(), 'yyyy-MM-dd'),
    startDate: task?.startDate || '',
    status: task?.status || 'pending',
    priority: task?.priority || 'medium',
    nextAction: task?.nextAction || '',
    estimatedMinutes: task?.estimatedMinutes,
    tags: task?.tags || [],
  });

  const [tagInput, setTagInput] = useState('');

  const userOptions = users.map((u) => ({ value: u.id, label: u.name }));
  const projectOptions = projects.map((p) => ({ value: p.id, label: p.title }));

  const handleChange = (field: keyof TaskFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((t) => t !== tag),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* タイトル */}
      <Input
        label="タイトル"
        value={formData.title}
        onChange={(e) => handleChange('title', e.target.value)}
        placeholder="タスク名を入力"
        required
      />

      {/* 説明 */}
      <Textarea
        label="説明"
        value={formData.description}
        onChange={(e) => handleChange('description', e.target.value)}
        placeholder="タスクの詳細を入力（任意）"
        rows={3}
      />

      {/* プロジェクト・担当者 */}
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="プロジェクト"
          value={formData.projectId}
          onChange={(e) => handleChange('projectId', e.target.value)}
          options={projectOptions}
          required
        />
        <Select
          label="担当者"
          value={formData.assigneeId}
          onChange={(e) => handleChange('assigneeId', e.target.value)}
          options={userOptions}
          required
        />
      </div>

      {/* 期日・開始日 */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          type="date"
          label="期日"
          value={formData.dueDate}
          onChange={(e) => handleChange('dueDate', e.target.value)}
          required
        />
        <Input
          type="date"
          label="開始日（任意）"
          value={formData.startDate}
          onChange={(e) => handleChange('startDate', e.target.value)}
        />
      </div>

      {/* 状態・優先度 */}
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="状態"
          value={formData.status}
          onChange={(e) => handleChange('status', e.target.value as TaskStatus)}
          options={statusOptions}
        />
        <Select
          label="優先度"
          value={formData.priority}
          onChange={(e) => handleChange('priority', e.target.value as Priority)}
          options={priorityOptions}
        />
      </div>

      {/* 次アクション */}
      <Input
        label="次アクション"
        value={formData.nextAction}
        onChange={(e) => handleChange('nextAction', e.target.value)}
        placeholder="次にやることを入力"
      />

      {/* 見積時間 */}
      <Input
        type="number"
        label="見積時間（分）"
        value={formData.estimatedMinutes || ''}
        onChange={(e) => handleChange('estimatedMinutes', e.target.value ? parseInt(e.target.value) : undefined)}
        placeholder="例: 60"
        min={0}
      />

      {/* タグ */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">タグ</label>
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="タグを入力"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
          />
          <Button type="button" variant="secondary" onClick={handleAddTag}>
            追加
          </Button>
        </div>
        {formData.tags && formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="badge bg-primary-50 text-primary-700 cursor-pointer"
                onClick={() => handleRemoveTag(tag)}
              >
                {tag} &times;
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ボタン */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          キャンセル
        </Button>
        <Button type="submit">
          {task ? '更新' : '作成'}
        </Button>
      </div>
    </form>
  );
}
