import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

interface MainMenuProps {
  onPlay: () => void;
  onSettings: () => void;
  showSettings: boolean;
  onCloseSettings: () => void;
}

const MainMenu = ({ onPlay, onSettings, showSettings, onCloseSettings }: MainMenuProps) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [soundVolume, setSoundVolume] = useState([70]);
  const [musicVolume, setMusicVolume] = useState([50]);
  const [showFPS, setShowFPS] = useState(false);

  return (
    <div className="w-full h-screen bg-gradient-to-br from-background via-background to-card flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-12">
        <div className="space-y-4">
          <h1 className="text-8xl font-bold bg-gradient-to-r from-primary via-purple-500 to-accent bg-clip-text text-transparent">
            MLS.game
          </h1>
          <p className="text-xl text-muted-foreground">3D Песочница с физикой</p>
        </div>

        <div className="flex flex-col gap-4 max-w-md mx-auto">
          <Button
            size="lg"
            onClick={onPlay}
            className="text-lg h-14 hover:scale-105 transition-transform"
          >
            <Icon name="Play" size={24} className="mr-2" />
            Играть
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            onClick={onSettings}
            className="text-lg h-14 hover:scale-105 transition-transform"
          >
            <Icon name="Settings" size={24} className="mr-2" />
            Настройки
          </Button>
        </div>
      </div>

      <Dialog open={showSettings} onOpenChange={onCloseSettings}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Icon name="Settings" size={28} />
              Настройки
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary">Аудио</h3>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="sound">Звуковые эффекты</Label>
                  <p className="text-sm text-muted-foreground">Звуки в игре</p>
                </div>
                <Switch
                  id="sound"
                  checked={soundEnabled}
                  onCheckedChange={setSoundEnabled}
                />
              </div>

              {soundEnabled && (
                <div className="space-y-2 pl-4">
                  <Label>Громкость: {soundVolume[0]}%</Label>
                  <Slider
                    value={soundVolume}
                    onValueChange={setSoundVolume}
                    max={100}
                    step={1}
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="music">Музыка</Label>
                  <p className="text-sm text-muted-foreground">Фоновая музыка</p>
                </div>
                <Switch
                  id="music"
                  checked={musicEnabled}
                  onCheckedChange={setMusicEnabled}
                />
              </div>

              {musicEnabled && (
                <div className="space-y-2 pl-4">
                  <Label>Громкость: {musicVolume[0]}%</Label>
                  <Slider
                    value={musicVolume}
                    onValueChange={setMusicVolume}
                    max={100}
                    step={1}
                  />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary">Графика</h3>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="fps">Показывать FPS</Label>
                  <p className="text-sm text-muted-foreground">Счётчик кадров</p>
                </div>
                <Switch
                  id="fps"
                  checked={showFPS}
                  onCheckedChange={setShowFPS}
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MainMenu;
