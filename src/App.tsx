import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import {
  MyDayPage,
  MyTasksPage,
  TeamBoardPage,
  TeamTimelinePage,
  TeamMembersPage,
  ProjectsPage,
  GoalsPage,
  SettingsPage,
} from './pages';
import { useUserStore, useProjectStore } from './store';

function InitRoute() {
  const { users } = useUserStore();
  const { projects } = useProjectStore();

  if (users.length === 0) return <Navigate to="/settings" replace />;
  if (projects.length === 0) return <Navigate to="/projects" replace />;
  return <Navigate to="/my/day" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default redirect: guide new users through onboarding */}
        <Route path="/" element={<InitRoute />} />

        {/* My pages */}
        <Route path="/my/day" element={<MyDayPage />} />
        <Route path="/my/tasks" element={<MyTasksPage />} />

        {/* Team pages */}
        <Route path="/team/board" element={<TeamBoardPage />} />
        <Route path="/team/timeline" element={<TeamTimelinePage />} />
        <Route path="/team/members" element={<TeamMembersPage />} />

        {/* Common pages */}
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/goals" element={<GoalsPage />} />
        <Route path="/settings" element={<SettingsPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/my/day" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
