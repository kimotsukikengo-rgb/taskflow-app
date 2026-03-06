import { useState } from 'react';
import { Trash2, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout';
import { Button, Input, Select, Modal, Avatar } from '../components/ui';
import { useSettingsStore, useUserStore, useProjectStore } from '../store';

export function SettingsPage() {
  const { appSettings, notificationSettings, updateAppSettings, updateNotificationSettings } = useSettingsStore();
  const { users, addUser, deleteUser, getCurrentUser, setCurrentUser } = useUserStore();
  const { projects } = useProjectStore();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({ name: '', email: '' });

  const handleAddUser = () => {
    if (newUserData.name && newUserData.email) {
      const isFirstUser = users.length === 0;
      addUser(newUserData);
      setNewUserData({ name: '', email: '' });
      setIsUserModalOpen(false);
      // 最初のメンバー追加後はプロジェクト作成へ誘導
      if (isFirstUser && projects.length === 0) {
        navigate('/projects');
      }
    }
  };

  const progressWeightOptions = [
    { value: 'time', label: '見積時間' },
    { value: 'points', label: '優先度ポイント' },
    { value: 'both', label: '時間×優先度' },
  ];

  const granularityOptions = [
    { value: 'minutes', label: '分単位' },
    { value: 'seconds', label: '秒単位' },
  ];

  return (
    <Layout title="設定">
      <div className="max-w-2xl space-y-6">
        {/* User Management */}
        <section className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">メンバー管理</h2>
            <Button size="sm" onClick={() => setIsUserModalOpen(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              メンバー追加
            </Button>
          </div>

          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  currentUser?.id === user.id ? 'bg-primary-50 border border-primary-200' : 'bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar user={user} />
                  <div>
                    <p className="font-medium text-slate-900">{user.name}</p>
                    <p className="text-sm text-slate-500">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {currentUser?.id !== user.id && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setCurrentUser(user.id)}
                    >
                      切り替え
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm(`${user.name}を削除しますか？`)) {
                        deleteUser(user.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-slate-400" />
                  </Button>
                </div>
              </div>
            ))}

            {users.length === 0 && (
              <p className="text-center text-slate-400 py-4">
                メンバーを追加してください
              </p>
            )}
          </div>
        </section>

        {/* Progress Settings */}
        <section className="card p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">進捗表示設定</h2>

          <div className="space-y-4">
            <Select
              label="円グラフの重み付け"
              value={appSettings.progressWeightBy}
              onChange={(e) =>
                updateAppSettings({
                  progressWeightBy: e.target.value as 'time' | 'points' | 'both',
                })
              }
              options={progressWeightOptions}
            />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-700">保留中は期限カウントを停止</p>
                <p className="text-sm text-slate-500">
                  保留状態のタスクは期限超過としてカウントしない
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={appSettings.holdPausesDeadline}
                  onChange={(e) =>
                    updateAppSettings({ holdPausesDeadline: e.target.checked })
                  }
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </section>

        {/* Notification Settings */}
        <section className="card p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">通知・カウントダウン設定</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-700">カウントダウン表示</p>
                <p className="text-sm text-slate-500">
                  タスクカードに残り時間を表示
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={notificationSettings.countdownEnabled}
                  onChange={(e) =>
                    updateNotificationSettings({ countdownEnabled: e.target.checked })
                  }
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            {notificationSettings.countdownEnabled && (
              <Select
                label="カウントダウン表示粒度"
                value={notificationSettings.countdownGranularity}
                onChange={(e) =>
                  updateNotificationSettings({
                    countdownGranularity: e.target.value as 'seconds' | 'minutes',
                  })
                }
                options={granularityOptions}
              />
            )}

            <Input
              type="number"
              label="期日リマインド（日前）"
              value={notificationSettings.dueReminderDays}
              onChange={(e) =>
                updateNotificationSettings({
                  dueReminderDays: parseInt(e.target.value) || 1,
                })
              }
              min={1}
              max={7}
            />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-700">期限超過アラート</p>
                <p className="text-sm text-slate-500">
                  期限を過ぎたタスクを通知
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={notificationSettings.enableOverdueAlert}
                  onChange={(e) =>
                    updateNotificationSettings({ enableOverdueAlert: e.target.checked })
                  }
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-700">レビュー滞留アラート</p>
                <p className="text-sm text-slate-500">
                  レビュー待ちが長時間続いた場合に通知
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={notificationSettings.enableReviewStaleAlert}
                  onChange={(e) =>
                    updateNotificationSettings({ enableReviewStaleAlert: e.target.checked })
                  }
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            {notificationSettings.enableReviewStaleAlert && (
              <Input
                type="number"
                label="レビュー滞留判定（時間）"
                value={notificationSettings.reviewStaleHours}
                onChange={(e) =>
                  updateNotificationSettings({
                    reviewStaleHours: parseInt(e.target.value) || 24,
                  })
                }
                min={1}
                max={168}
              />
            )}
          </div>
        </section>
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        title="メンバー追加"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsUserModalOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleAddUser}>追加</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="名前"
            value={newUserData.name}
            onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
            placeholder="山田 太郎"
            required
          />
          <Input
            type="email"
            label="メールアドレス"
            value={newUserData.email}
            onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
            placeholder="yamada@example.com"
            required
          />
        </div>
      </Modal>
    </Layout>
  );
}
