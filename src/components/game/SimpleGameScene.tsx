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
  const playerRef = useRef({ x: 0, y: 2.5, z: 0, yaw: 0, pitch: 0, velocityY: 0, onGround: false });
  const keysRef = useRef({ w: false, a: false, s: false, d: false, space: false });
  const [isLocked, setIsLocked] = useState(false);
  const playerIdRef = useRef(`player_${Math.random().toString(36).substr(2, 9)}`);
  const lastSaveTime = useRef(0);

  useEffect(() => {
    const loadPosition = async () => {
      try {
        const response = await fetch('https://functions.poehali.dev/c1392dec-ff22-4068-ad04-acfb0ee2e39b', {
          headers: { 'X-Player-Id': playerIdRef.current }
        });
        const position = await response.json();
        playerRef.current.x = position.x;
        playerRef.current.y = position.y;
        playerRef.current.z = position.z;
        playerRef.current.yaw = position.yaw;
        playerRef.current.pitch = position.pitch;
      } catch (error) {
        console.error('Failed to load position:', error);
      }
    };
    loadPosition();

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
        const k = key === ' ' ? 'space' : key;
        keysRef.current[k as keyof typeof keysRef.current] = true;
      }
      if (key === 'escape') {
        document.exitPointerLock();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', ' '].includes(key)) {
        e.preventDefault();
        const k = key === ' ' ? 'space' : key;
        keysRef.current[k as keyof typeof keysRef.current] = false;
      }
    };

    const handlePointerLockChange = () => {
      setIsLocked(document.pointerLockElement === canvasRef.current);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement === canvasRef.current) {
        const sensitivity = 0.002;
        playerRef.current.yaw += e.movementX * sensitivity;
        playerRef.current.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, playerRef.current.pitch - e.movementY * sensitivity));
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
      const player = playerRef.current;
      const keys = keysRef.current;
      
      const forward = {
        x: Math.sin(player.yaw),
        z: Math.cos(player.yaw)
      };
      const right = {
        x: Math.cos(player.yaw),
        z: -Math.sin(player.yaw)
      };

      if (keys.w) {
        player.x += forward.x * speed;
        player.z += forward.z * speed;
      }
      if (keys.s) {
        player.x -= forward.x * speed;
        player.z -= forward.z * speed;
      }
      if (keys.a) {
        player.x -= right.x * speed;
        player.z -= right.z * speed;
      }
      if (keys.d) {
        player.x += right.x * speed;
        player.z += right.z * speed;
      }

      const gravity = -20 * deltaTime;
      player.velocityY += gravity;
      player.y += player.velocityY * deltaTime;

      const blockUnderPlayer = blocks.find(
        b => Math.floor(player.x) === b.x && Math.floor(player.z) === b.z && b.y === 0
      );

      if (blockUnderPlayer && player.y <= 2.0) {
        player.y = 2.0;
        player.velocityY = 0;
        player.onGround = true;
      } else {
        player.onGround = false;
      }

      if (keys.space && player.onGround) {
        player.velocityY = 8;
      }

      if (currentTime - lastSaveTime.current > 2000) {
        lastSaveTime.current = currentTime;
        fetch('https://functions.poehali.dev/c1392dec-ff22-4068-ad04-acfb0ee2e39b', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Player-Id': playerIdRef.current
          },
          body: JSON.stringify({
            x: player.x,
            y: player.y,
            z: player.z,
            yaw: player.yaw,
            pitch: player.pitch
          })
        }).catch(err => console.error('Failed to save position:', err));
      }

      ctx.fillStyle = '#87CEEB';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const halfWidth = canvas.width / 2;
      const halfHeight = canvas.height / 2;
      const scale = 500;

      const sortedBlocks = blocks
        .map(block => {
          const dx = block.x - player.x;
          const dy = block.y - player.y + 1.0;
          const dz = block.z - player.z;
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
          return { block, distance };
        })
        .sort((a, b) => b.distance - a.distance);

      sortedBlocks.forEach(({ block }) => {
        const drawCubeFace = (
          corners: Array<[number, number, number]>,
          faceColor: string
        ) => {
          const screenCorners = corners.map(([x, y, z]) => {
            const dx = block.x + x - player.x;
            const dy = block.y + y - player.y + 1.0;
            const dz = block.z + z - player.z;

            const cosYaw = Math.cos(player.yaw);
            const sinYaw = Math.sin(player.yaw);
            const rx = dx * cosYaw - dz * sinYaw;
            const rz = dx * sinYaw + dz * cosYaw;

            const cosPitch = Math.cos(player.pitch);
            const sinPitch = Math.sin(player.pitch);
            const ry = dy * cosPitch - rz * sinPitch;
            const rzPitch = dy * sinPitch + rz * cosPitch;

            if (rzPitch <= 0.1) return null;

            return {
              x: halfWidth + (rx / rzPitch) * scale,
              y: halfHeight - (ry / rzPitch) * scale,
              z: rzPitch
            };
          });

          if (screenCorners.some(c => c === null)) return;

          const avgZ = screenCorners.reduce((sum, c) => sum + (c?.z || 0), 0) / screenCorners.length;
          const brightness = Math.max(0.3, 1 - avgZ / 30);
          const r = parseInt(faceColor.slice(1, 3), 16);
          const g = parseInt(faceColor.slice(3, 5), 16);
          const b = parseInt(faceColor.slice(5, 7), 16);

          ctx.fillStyle = `rgb(${r * brightness}, ${g * brightness}, ${b * brightness})`;
          ctx.beginPath();
          ctx.moveTo(screenCorners[0]!.x, screenCorners[0]!.y);
          for (let i = 1; i < screenCorners.length; i++) {
            ctx.lineTo(screenCorners[i]!.x, screenCorners[i]!.y);
          }
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = `rgba(0,0,0,${brightness * 0.8})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        };

        const s = 0.5;
        drawCubeFace([[-s,-s,s], [s,-s,s], [s,s,s], [-s,s,s]], block.color);
        drawCubeFace([[-s,-s,-s], [-s,s,-s], [s,s,-s], [s,-s,-s]], '#1a9d4a');
        drawCubeFace([[-s,s,-s], [-s,s,s], [s,s,s], [s,s,-s]], '#2dd56b');
        drawCubeFace([[-s,-s,-s], [s,-s,-s], [s,-s,s], [-s,-s,s]], '#188a3e');
        drawCubeFace([[-s,-s,-s], [-s,-s,s], [-s,s,s], [-s,s,-s]], '#1ea850');
        drawCubeFace([[s,-s,-s], [s,s,-s], [s,s,s], [s,-s,s]], '#1ea850');
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
  }, [blocks]);

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