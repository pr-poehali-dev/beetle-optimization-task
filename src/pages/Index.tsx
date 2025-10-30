import { useState } from "react";
import MainMenu from "@/components/game/MainMenu";
import SimpleGameScene from "@/components/game/SimpleGameScene";

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

  return <SimpleGameScene onBackToMenu={() => setGameStarted(false)} />;
};

export default Index;