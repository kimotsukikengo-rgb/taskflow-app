import { useState } from 'react';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { Layout } from '../components/layout';
import { Button, Input, Textarea, Modal, ProgressRing } from '../components/ui';
import { useProjectStore, useTaskStore, useUserStore } from '../store';
import type { Project } from '../types';

export function ProjectsPage() {
  const { projects, addProject, updateProject, deleteProject } = useProjectStore();
  const { tasks } = useTaskStore();
  const { getCurrentUser } = useUserStore();
  const currentUser = getCurrentUser();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | undefined>();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
  });

  const handleOpenModal = (project?: Project) => {
    if (project) {
      setSelectedProject(project);
      setFormData({
        title: project.title,
        description: project.description || '',
        startDate: project.startDate || '',
        endDate: project.endDate || '',
      });
    } else {
      setSelectedProject(undefined);
      setFormData({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (!currentUser) return;

    if (selectedProject) {
      updateProject(selectedProject.id, formData);
    } else {
      addProject({
        ...formData,
        ownerId: currentUser.id,
        memberIds: [currentUser.id],
      });
    }
    setIsModalOpen(false);
  };

  const getProjectStats = (projectId: string) => {
    const projectTasks = tasks.filter((t) => t.projectId === projectId);
    const completed = projectTasks.filter((t) => t.status === 'completed').length;
    const total = projectTasks.length;
    return {
      total,
      completed,
      progress: total > 0 ? (completed / total) * 100 : 0,
    };
  };

  return (
    <Layout title="プロジェクト">
      {/* Warning when no current user */}
      {!currentUser && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-amber-800">先に「設定」でメンバーを追加してください</p>
            <p className="text-sm text-amber-700 mt-1">メンバー登録後にプロジェクトを作成できます。</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-slate-500">{projects.length}個のプロジェクト</p>
        <Button onClick={() => handleOpenModal()} disabled={!currentUser}>
          <Plus className="w-4 h-4 mr-2" />
          新規プロジェクト
        </Button>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => {
          const stats = getProjectStats(project.id);
          return (
            <div
              key={project.id}
              className="card p-5 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleOpenModal(project)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: project.color }}
                  >
                    {project.title[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">{project.title}</h3>
                    {project.description && (
                      <p className="text-sm text-slate-500 line-clamp-1">
                        {project.description}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  className="p-1 hover:bg-slate-100 rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('このプロジェクトを削除しますか？')) {
                      deleteProject(project.id);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="text-slate-500">タスク: </span>
                  <span className="font-medium text-slate-900">
                    {stats.completed}/{stats.total}
                  </span>
                </div>
                <ProgressRing
                  progress={stats.progress}
                  size={40}
                  strokeWidth={3}
                  color={stats.progress >= 80 ? 'success' : stats.progress >= 50 ? 'primary' : 'warning'}
                />
              </div>

              {/* Dates */}
              {(project.startDate || project.endDate) && (
                <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                  {project.startDate && <span>{project.startDate}</span>}
                  {project.startDate && project.endDate && <span> - </span>}
                  {project.endDate && <span>{project.endDate}</span>}
                </div>
              )}
            </div>
          );
        })}

        {projects.length === 0 && (
          <div className="col-span-full card p-12 text-center">
            <p className="text-slate-400 mb-4">プロジェクトがありません</p>
            <Button onClick={() => handleOpenModal()}>
              最初のプロジェクトを作成
            </Button>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedProject ? 'プロジェクトを編集' : '新規プロジェクト'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleSubmit}>
              {selectedProject ? '更新' : '作成'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="プロジェクト名"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="プロジェクト名を入力"
            required
          />
          <Textarea
            label="説明"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="プロジェクトの説明（任意）"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              label="開始日"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
            <Input
              type="date"
              label="終了日"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
