import { useState } from 'react';
import { Plus, Trash2, Target } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Layout } from '../components/layout';
import { Button, Input, Textarea, Modal, ProgressRing } from '../components/ui';
import { useProjectStore, useTaskStore } from '../store';
import type { Goal } from '../types';

export function GoalsPage() {
  const { goals, addGoal, updateGoal, deleteGoal, getProjectsByGoal } = useProjectStore();
  const { tasks } = useTaskStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | undefined>();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetDate: '',
  });

  const handleOpenModal = (goal?: Goal) => {
    if (goal) {
      setSelectedGoal(goal);
      setFormData({
        title: goal.title,
        description: goal.description || '',
        targetDate: goal.targetDate || '',
      });
    } else {
      setSelectedGoal(undefined);
      setFormData({
        title: '',
        description: '',
        targetDate: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (selectedGoal) {
      updateGoal(selectedGoal.id, formData);
    } else {
      addGoal(formData);
    }
    setIsModalOpen(false);
  };

  const getGoalStats = (goalId: string) => {
    const goalProjects = getProjectsByGoal(goalId);
    const projectIds = goalProjects.map((p) => p.id);
    const goalTasks = tasks.filter((t) => projectIds.includes(t.projectId));
    const completed = goalTasks.filter((t) => t.status === 'completed').length;
    const total = goalTasks.length;
    return {
      projectCount: goalProjects.length,
      taskCount: total,
      completedCount: completed,
      progress: total > 0 ? (completed / total) * 100 : 0,
    };
  };

  return (
    <Layout title="目標">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-slate-500">{goals.length}個の目標</p>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          新規目標
        </Button>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {goals.map((goal) => {
          const stats = getGoalStats(goal.id);
          return (
            <div
              key={goal.id}
              className="card p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleOpenModal(goal)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary-100">
                    <Target className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{goal.title}</h3>
                    {goal.description && (
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                        {goal.description}
                      </p>
                    )}
                    {goal.targetDate && (
                      <p className="text-sm text-slate-400 mt-2">
                        目標日: {format(parseISO(goal.targetDate), 'yyyy年M月d日', { locale: ja })}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-6 mt-4 text-sm">
                      <div>
                        <span className="text-slate-500">プロジェクト: </span>
                        <span className="font-medium text-slate-900">{stats.projectCount}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">タスク: </span>
                        <span className="font-medium text-slate-900">
                          {stats.completedCount}/{stats.taskCount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <ProgressRing
                    progress={stats.progress}
                    size={64}
                    strokeWidth={4}
                    color={stats.progress >= 80 ? 'success' : stats.progress >= 50 ? 'primary' : 'warning'}
                  />
                  <button
                    className="p-2 hover:bg-slate-100 rounded-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('この目標を削除しますか？')) {
                        deleteGoal(goal.id);
                      }
                    }}
                  >
                    <Trash2 className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {goals.length === 0 && (
          <div className="card p-12 text-center">
            <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400 mb-4">目標がありません</p>
            <Button onClick={() => handleOpenModal()}>
              最初の目標を設定
            </Button>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedGoal ? '目標を編集' : '新規目標'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleSubmit}>
              {selectedGoal ? '更新' : '作成'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="目標タイトル"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="達成したい目標を入力"
            required
          />
          <Textarea
            label="説明"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="目標の詳細や背景（任意）"
          />
          <Input
            type="date"
            label="目標日"
            value={formData.targetDate}
            onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
          />
        </div>
      </Modal>
    </Layout>
  );
}
