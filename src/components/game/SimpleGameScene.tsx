import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";

interface SimpleGameSceneProps {
  onBackToMenu: () => void;
}

interface Block {
  x: number;
  y: number;
  z: number;
  color: string;
}

const SimpleGameScene = ({ onBackToMenu }: SimpleGameSceneProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [player, setPlayer] = useState({ x: 0, y: 2, z: 0, yaw: 0, pitch: 0 });
  const [keys, setKeys] = useState({ w: false, a: false, s: false, d: false, space: false });
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const groundBlocks: Block[] = [];
    for (let x = -25; x < 25; x++) {
      for (let z = -25; z < 25; z++) {
        groundBlocks.push({ x, y: 0, z, color: '#22c55e' });
      }
    }
    setBlocks(groundBlocks);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'control') {
        e.preventDefault();
        const canvas = canvasRef.current;
        if (canvas) {
          if (!isLocked) {
            canvas.requestPointerLock();
          } else {
            document.exitPointerLock();
          }
        }
      }
      if (['w', 'a', 's', 'd', ' '].includes(key)) {
        e.preventDefault();
        setKeys(prev => ({ ...prev, [key === ' ' ? 'space' : key]: true }));
      }
      if (key === 'escape') {
        document.exitPointerLock();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', ' '].includes(key)) {
        e.preventDefault();
        setKeys(prev => ({ ...prev, [key === ' ' ? 'space' : key]: false }));
      }
    };

    const handlePointerLockChange = () => {
      setIsLocked(document.pointerLockElement === canvasRef.current);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement === canvasRef.current) {
        const sensitivity = 0.002;
        setPlayer(prev => ({
          ...prev,
          yaw: prev.yaw - e.movementX * sensitivity,
          pitch: Math.max(-Math.PI / 2, Math.min(Math.PI / 2, prev.pitch - e.movementY * sensitivity))
        }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('pointerlockchange', handlePointerLockChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
    };
  }, [isLocked]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const gameLoop = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      const speed = 5 * deltaTime;
      const forward = {
        x: Math.sin(player.yaw),
        z: Math.cos(player.yaw)
      };
      const right = {
        x: Math.cos(player.yaw),
        z: -Math.sin(player.yaw)
      };

      let newX = player.x;
      let newZ = player.z;

      if (keys.w) {
        newX += forward.x * speed;
        newZ += forward.z * speed;
      }
      if (keys.s) {
        newX -= forward.x * speed;
        newZ -= forward.z * speed;
      }
      if (keys.a) {
        newX -= right.x * speed;
        newZ -= right.z * speed;
      }
      if (keys.d) {
        newX += right.x * speed;
        newZ += right.z * speed;
      }

      setPlayer(prev => ({ ...prev, x: newX, z: newZ }));

      ctx.fillStyle = '#87CEEB';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const fov = Math.PI / 3;
      const halfWidth = canvas.width / 2;
      const halfHeight = canvas.height / 2;
      const scale = 500;

      blocks.forEach(block => {
        const dx = block.x - player.x;
        const dy = block.y - player.y + 1;
        const dz = block.z - player.z;

        const cos = Math.cos(player.yaw);
        const sin = Math.sin(player.yaw);
        const rx = dx * cos - dz * sin;
        const rz = dx * sin + dz * cos;

        if (rz <= 0.1) return;

        const screenX = halfWidth + (rx / rz) * scale;
        const screenY = halfHeight - (dy / rz) * scale;
        const size = scale / rz;

        const brightness = Math.max(0.3, 1 - rz / 30);
        const color = block.color;
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        
        ctx.fillStyle = `rgb(${r * brightness}, ${g * brightness}, ${b * brightness})`;
        ctx.fillRect(screenX - size / 2, screenY - size / 2, size, size);
        ctx.strokeStyle = `rgba(0,0,0,${brightness * 0.3})`;
        ctx.strokeRect(screenX - size / 2, screenY - size / 2, size, size);
      });

      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fillRect(halfWidth - 2, halfHeight - 2, 4, 4);
      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      ctx.strokeRect(halfWidth - 10, halfHeight - 10, 20, 20);

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [player, keys, blocks]);

  return (
    <div className="w-full h-screen relative bg-black">
      <canvas
        ref={canvasRef}
        width={1920}
        height={1080}
        className="w-full h-full cursor-crosshair"
      />

      <Card className="absolute top-4 left-4 p-4 bg-card/90 backdrop-blur-md border border-border/50">
        <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
          <Icon name="Boxes" size={24} />
          MLS.game
        </h2>
        
        <div className="space-y-4">
          <Button
            onClick={onBackToMenu}
            variant="outline"
            className="w-full"
          >
            <Icon name="Home" size={20} className="mr-2" />
            Главное меню
          </Button>

          <div className="text-sm text-muted-foreground space-y-1 pt-2 border-t border-border">
            <p className="font-semibold text-foreground mb-2">Управление:</p>
            <p className="text-xs">⌨️ Ctrl - {isLocked ? 'разблокировать' : 'блокировать'} мышь</p>
            <p className="text-xs">⌨️ W/A/S/D - движение</p>
            <p className="text-xs">🖱️ Мышь - обзор</p>
            <p className="text-xs">⌨️ ESC - выход из блокировки</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SimpleGameScene;
