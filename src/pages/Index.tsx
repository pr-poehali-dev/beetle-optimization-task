import { useState, Suspense, lazy } from "react";
import MainMenu from "@/components/game/MainMenu";

const GameScene = lazy(() => import("@/components/game/GameScene"));

const Index = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  if (!gameStarted) {
    return (
      <MainMenu
        onPlay={() => setGameStarted(true)}
        onSettings={() => setShowSettings(true)}
        showSettings={showSettings}
        onCloseSettings={() => setShowSettings(false)}
      />
    );
  }

  return (
    <Suspense fallback={
      <div className="w-full h-screen bg-background flex items-center justify-center">
        <div className="text-2xl text-primary">Загрузка игры...</div>
      </div>
    }>
      <GameScene onBackToMenu={() => setGameStarted(false)} />
    </Suspense>
  );
};

export default Index;