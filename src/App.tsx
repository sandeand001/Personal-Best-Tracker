import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAppStore } from "./app/store";
import { ThemeProvider } from "./app/providers/ThemeProvider";
import { RootLayout } from "./app/layout/RootLayout";
import { AvatarPage } from "./features/avatar/AvatarPage";
import { LogPRPage } from "./features/log-pr/LogPRPage";
import { AchievementsPage } from "./features/achievements/AchievementsPage";
import { HistoryPage } from "./features/history/HistoryPage";
import { SettingsPage } from "./features/settings/SettingsPage";
import { RegionDetailPage } from "./features/region/RegionDetailPage";
import { ExerciseDetailPage } from "./features/exercise/ExerciseDetailPage";
import { PRCelebrationModal } from "./features/pr-celebration/PRCelebrationModal";

function App() {
  const init = useAppStore((s) => s.init);
  useEffect(() => {
    init();
  }, [init]);

  return (
    <ThemeProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route element={<RootLayout />}>
            <Route index element={<AvatarPage />} />
            <Route path="log" element={<LogPRPage />} />
            <Route path="achievements" element={<AchievementsPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="region/:region" element={<RegionDetailPage />} />
            <Route path="exercise/:exerciseId" element={<ExerciseDetailPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
        <PRCelebrationModal />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
