import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './store/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { Backups } from './pages/Backups';
import { Settings } from './pages/Settings';
import { HermesProfiles } from './pages/HermesProfiles';
import { ClaudeCodeProfiles } from './pages/ClaudeCodeProfiles';
import { CodexProfiles } from './pages/CodexProfiles';
import { OpenClawProfiles } from './pages/OpenClawProfiles';
import { OpenRouter } from './pages/OpenRouter';
import { Updates } from './pages/Updates';

function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/hermes" replace />} />
            <Route path="/hermes" element={<HermesProfiles />} />
            <Route path="/claude-code" element={<ClaudeCodeProfiles />} />
            <Route path="/codex" element={<CodexProfiles />} />
            <Route path="/openclaw" element={<OpenClawProfiles />} />
            <Route path="/openrouter" element={<OpenRouter />} />
            <Route path="/updates" element={<Updates />} />
            <Route path="/backups" element={<Backups />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}

export default App;
