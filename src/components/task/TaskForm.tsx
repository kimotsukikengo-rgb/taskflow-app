import { useState } from 'react';
import { format } from 'date-fns';
import { AlertCircle } from 'lucide-react';
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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const userOptions = users.map((u) => ({ value: u.id, label: u.name }));
  const projectOptions = projects.map((p) => ({ value: p.id, label: p.title }));

  const noUsers = users.length === 0;
  const noProjects = projects.length === 0;

  const handleChange = (field: keyof TaskFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'タイトルは必須です';
    if (!formData.projectId) newErrors.projectId = 'プロジェクトを選択してください';
    if (!formData.assigneeId) newErrors.assigneeId = '担当者を選択してください';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
    if (validate()) {
      onSubmit(formData);
    }
  };

  // プロジェクトまたはユーザーが未登録の場合
  if (noUsers || noProjects) {
    return (
      <div className="space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-amber-800">タスクを作成する前に設定が必要です</p>
              <ul className="mt-2 space-y-1 text-sm text-amber-700">
                {noUsers && <li>① 左メニューの「設定」でメンバーを追加してください</li>}
                {noProjects && <li>{noUsers ? '②' : '①'} 左メニューの「プロジェクト」でプロジェクトを作成してください</li>}
              </ul>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="button" variant="secondary" onClick={onCancel}>
            閉じる
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="タイトル"
        value={formData.title}
        onChange={(e) => handleChange('title', e.target.value)}
        placeholder="タスク名を入力"
        error={errors.title}
      />

      <Textarea
        label="説明"
        value={formData.description}
        onChange={(e) => handleChange('description', e.target.value)}
        placeholder="タスクの詳細を入力（任意）"
        rows={3}
      />

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="プロジェクト"
          value={formData.projectId}
          onChange={(e) => handleChange('projectId', e.target.value)}
          options={projectOptions}
          error={errors.projectId}
        />
        <Select
          label="担当者"
          value={formData.assigneeId}
          onChange={(e) => handleChange('assigneeId', e.target.value)}
          options={userOptions}
          error={errors.assigneeId}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          type="date"
          label="期日"
          value={formData.dueDate}
          onChange={(e) => handleChange('dueDate', e.target.value)}
          error={errors.dueDate}
        />
        <Input
          type="date"
          label="開始日（任意）"
          value={formData.startDate}
          onChange={(e) => handleChange('startDate', e.target.value)}
        />
      </div>

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

      <Input
        label="次アクション"
        value={formData.nextAction}
        onChange={(e) => handleChange('nextAction', e.target.value)}
        placeholder="次にやることを入力"
      />

      <Input
        type="number"
        label="見積時間（分）"
        value={formData.estimatedMinutes || ''}
        onChange={(e) => handleChange('estimatedMinutes', e.target.value ? parseInt(e.target.value) : undefined)}
        placeholder="例: 60"
        min={0}
      />

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">タグ</label>
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="タグを入力してEnter"
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
