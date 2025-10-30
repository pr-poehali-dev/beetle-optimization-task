import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { OrbitControls, Sky, Stats } from "@react-three/drei";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import Ground from "@/components/game/Ground";
import Player from "@/components/game/Player";
import GameObjects from "@/components/game/GameObjects";
import { useToast } from "@/hooks/use-toast";

export interface GameObject {
  id: string;
  type: 'box' | 'sphere' | 'cylinder';
  position: [number, number, number];
  color: string;
}

interface GameSceneProps {
  onBackToMenu: () => void;
}

const GameScene = ({ onBackToMenu }: GameSceneProps) => {
  const [objects, setObjects] = useState<GameObject[]>([]);
  const [showStats, setShowStats] = useState(false);
  const { toast } = useToast();

  const addObject = (type: 'box' | 'sphere' | 'cylinder') => {
    const colors = ['#8b5cf6', '#06b6d4', '#ec4899', '#f59e0b', '#10b981'];
    const newObject: GameObject = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      position: [Math.random() * 10 - 5, 10, Math.random() * 10 - 5],
      color: colors[Math.floor(Math.random() * colors.length)]
    };
    setObjects(prev => [...prev, newObject]);
    toast({
      title: "Объект создан",
      description: `Добавлен ${type === 'box' ? 'куб' : type === 'sphere' ? 'сфера' : 'цилиндр'}`
    });
  };

  const clearObjects = () => {
    setObjects([]);
    toast({
      title: "Мир очищен",
      description: "Все объекты удалены"
    });
  };

  return (
    <div className="w-full h-screen relative">
      <Canvas
        camera={{ position: [10, 10, 10], fov: 50 }}
        shadows
      >
        <Sky sunPosition={[100, 20, 100]} />
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        
        <Physics gravity={[0, -9.81, 0]}>
          <Ground />
          <Player />
          <GameObjects objects={objects} />
        </Physics>
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={50}
        />
        {showStats && <Stats />}
      </Canvas>

      <Card className="absolute top-4 left-4 p-4 bg-card/90 backdrop-blur-md border border-border/50">
        <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
          <Icon name="Boxes" size={24} />
          MLS.game
        </h2>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Создать объект:</p>
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => addObject('box')}
                className="w-full"
              >
                <Icon name="Box" size={20} className="mr-2" />
                Куб
              </Button>
              <Button
                onClick={() => addObject('sphere')}
                className="w-full"
              >
                <Icon name="Circle" size={20} className="mr-2" />
                Сфера
              </Button>
              <Button
                onClick={() => addObject('cylinder')}
                className="w-full"
              >
                <Icon name="Cylinder" size={20} className="mr-2" />
                Цилиндр
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              onClick={clearObjects}
              variant="destructive"
              className="w-full"
            >
              <Icon name="Trash2" size={20} className="mr-2" />
              Очистить мир
            </Button>
            
            <Button
              onClick={() => setShowStats(!showStats)}
              variant="outline"
              className="w-full"
            >
              <Icon name="BarChart" size={20} className="mr-2" />
              {showStats ? 'Скрыть' : 'Показать'} FPS
            </Button>

            <Button
              onClick={onBackToMenu}
              variant="outline"
              className="w-full"
            >
              <Icon name="Home" size={20} className="mr-2" />
              Главное меню
            </Button>
          </div>

          <div className="text-sm text-muted-foreground space-y-1 pt-2 border-t border-border">
            <p>Объектов: {objects.length}</p>
            <p className="text-xs">🖱️ ЛКМ + перетаскивание - вращение</p>
            <p className="text-xs">🖱️ ПКМ + перетаскивание - перемещение</p>
            <p className="text-xs">🖱️ Колесико - приближение</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GameScene;
