import { Canvas, useThree } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { Sky, Stats } from "@react-three/drei";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import Ground from "@/components/game/Ground";
import Player from "@/components/game/Player";
import GameObjects from "@/components/game/GameObjects";
import { useToast } from "@/hooks/use-toast";
import * as THREE from "three";

export interface GameObject {
  id: string;
  type: 'box' | 'sphere' | 'cylinder';
  position: [number, number, number];
  color: string;
}

interface GameSceneProps {
  onBackToMenu: () => void;
}

const MouseControls = ({ 
  objects, 
  setObjects 
}: { 
  objects: GameObject[]; 
  setObjects: React.Dispatch<React.SetStateAction<GameObject[]>>;
}) => {
  const { camera, scene } = useThree();
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  useEffect(() => {
    const handleMouseClick = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (event.button === 0) {
        if (intersects.length > 0) {
          const hit = intersects[0];
          const normal = hit.face?.normal;
          if (normal) {
            const worldNormal = normal.clone().transformDirection(hit.object.matrixWorld);
            const placePosition = hit.point.clone().add(worldNormal.multiplyScalar(0.5));
            
            const colors = ['#8b5cf6', '#06b6d4', '#ec4899', '#f59e0b', '#10b981'];
            const newObject: GameObject = {
              id: Math.random().toString(36).substr(2, 9),
              type: 'box',
              position: [
                Math.round(placePosition.x),
                Math.round(placePosition.y),
                Math.round(placePosition.z)
              ],
              color: colors[Math.floor(Math.random() * colors.length)]
            };
            setObjects(prev => [...prev, newObject]);
          }
        }
      } else if (event.button === 2) {
        if (intersects.length > 0) {
          const hit = intersects[0];
          const hitPosition = hit.point.clone().sub(hit.face?.normal.clone().multiplyScalar(0.5) || new THREE.Vector3());
          
          setObjects(prev => prev.filter(obj => {
            const objPos = new THREE.Vector3(...obj.position);
            const distance = objPos.distanceTo(hitPosition);
            return distance > 0.7;
          }));
        }
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    window.addEventListener('mousedown', handleMouseClick);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('mousedown', handleMouseClick);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [camera, scene, objects, setObjects]);

  return null;
};

const GameScene = ({ onBackToMenu }: GameSceneProps) => {
  const [objects, setObjects] = useState<GameObject[]>([]);
  const [showStats, setShowStats] = useState(false);
  const { toast } = useToast();

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
        
        <MouseControls objects={objects} setObjects={setObjects} />
        {showStats && <Stats />}
      </Canvas>

      <Card className="absolute top-4 left-4 p-4 bg-card/90 backdrop-blur-md border border-border/50">
        <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
          <Icon name="Boxes" size={24} />
          MLS.game
        </h2>
        
        <div className="space-y-4">
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
            <p className="font-semibold text-foreground mb-2">Управление:</p>
            <p className="text-xs">⌨️ W/A/S/D - движение</p>
            <p className="text-xs">⌨️ Пробел - прыжок</p>
            <p className="text-xs">🖱️ ЛКМ - поставить блок</p>
            <p className="text-xs">🖱️ ПКМ - убрать блок</p>
            <p className="text-xs mt-2">Блоков: {objects.length}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GameScene;
