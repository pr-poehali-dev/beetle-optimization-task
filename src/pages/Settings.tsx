import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [soundVolume, setSoundVolume] = useState([70]);
  const [musicVolume, setMusicVolume] = useState([50]);
  const [showFPS, setShowFPS] = useState(false);
  const [particleEffects, setParticleEffects] = useState(true);

  const handleSave = () => {
    toast({
      title: "Настройки сохранены",
      description: "Ваши настройки успешно применены"
    });
  };

  const handleReset = () => {
    setSoundEnabled(true);
    setMusicEnabled(true);
    setSoundVolume([70]);
    setMusicVolume([50]);
    setShowFPS(false);
    setParticleEffects(true);
    toast({
      title: "Настройки сброшены",
      description: "Восстановлены настройки по умолчанию"
    });
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-primary pixel-font flex items-center gap-3">
            <Icon name="Settings" size={40} />
            Настройки
          </h1>
          <Button variant="outline" onClick={() => navigate('/')} className="pixel-font">
            <Icon name="Home" size={20} className="mr-2" />
            Домой
          </Button>
        </div>

        <Card className="p-6 bg-card">
          <h2 className="text-2xl font-bold text-accent mb-4 pixel-font flex items-center gap-2">
            <Icon name="Volume2" size={28} />
            Аудио
          </h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="sound" className="text-foreground pixel-font">Звуковые эффекты</Label>
                <p className="text-sm text-muted-foreground pixel-font">Включить звуки выстрелов и взрывов</p>
              </div>
              <Switch
                id="sound"
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
              />
            </div>

            {soundEnabled && (
              <div className="space-y-2 pl-4">
                <Label className="text-foreground pixel-font">Громкость звуков: {soundVolume[0]}%</Label>
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
                <Label htmlFor="music" className="text-foreground pixel-font">Музыка</Label>
                <p className="text-sm text-muted-foreground pixel-font">Фоновая музыка в игре</p>
              </div>
              <Switch
                id="music"
                checked={musicEnabled}
                onCheckedChange={setMusicEnabled}
              />
            </div>

            {musicEnabled && (
              <div className="space-y-2 pl-4">
                <Label className="text-foreground pixel-font">Громкость музыки: {musicVolume[0]}%</Label>
                <Slider
                  value={musicVolume}
                  onValueChange={setMusicVolume}
                  max={100}
                  step={1}
                />
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6 bg-card">
          <h2 className="text-2xl font-bold text-accent mb-4 pixel-font flex items-center gap-2">
            <Icon name="Monitor" size={28} />
            Графика
          </h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="fps" className="text-foreground pixel-font">Показывать FPS</Label>
                <p className="text-sm text-muted-foreground pixel-font">Отображение счётчика кадров</p>
              </div>
              <Switch
                id="fps"
                checked={showFPS}
                onCheckedChange={setShowFPS}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="particles" className="text-foreground pixel-font">Эффекты частиц</Label>
                <p className="text-sm text-muted-foreground pixel-font">Визуальные эффекты взрывов</p>
              </div>
              <Switch
                id="particles"
                checked={particleEffects}
                onCheckedChange={setParticleEffects}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card">
          <h2 className="text-2xl font-bold text-accent mb-4 pixel-font flex items-center gap-2">
            <Icon name="Info" size={28} />
            О игре
          </h2>
          <div className="space-y-2 text-foreground pixel-font">
            <p><strong>Название:</strong> Pixel Shooter</p>
            <p><strong>Версия:</strong> 1.0.0</p>
            <p><strong>Жанр:</strong> Ретро-стрелялка</p>
            <p><strong>Платформа:</strong> Web</p>
          </div>
        </Card>

        <div className="flex gap-4">
          <Button size="lg" onClick={handleSave} className="flex-1 pixel-font">
            <Icon name="Save" size={24} className="mr-2" />
            Сохранить
          </Button>
          <Button size="lg" variant="outline" onClick={handleReset} className="pixel-font">
            <Icon name="RotateCcw" size={24} className="mr-2" />
            Сброс
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
