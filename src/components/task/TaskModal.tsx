import { Modal } from '../ui';
import { TaskForm, type TaskFormData } from './TaskForm';
import type { Task } from '../../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task;
  projectId?: string;
  onSubmit: (data: TaskFormData) => void;
}

export function TaskModal({ isOpen, onClose, task, projectId, onSubmit }: TaskModalProps) {
  const handleSubmit = (data: TaskFormData) => {
    onSubmit(data);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? 'タスクを編集' : '新規タスク'}
      size="lg"
    >
      <TaskForm
        task={task}
        projectId={projectId}
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </Modal>
  );
}
