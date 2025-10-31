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
  scaleX?: number;
  scaleY?: number;
  scaleZ?: number;
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
    const colors = ['#22c55e', '#16a34a', '#15803d', '#14532d', '#78716c', '#57534e', '#a8a29e'];
    
    for (let x = -25; x < 25; x += 0.35) {
      for (let z = -25; z < 25; z += 0.35) {
        const height = Math.floor(
          Math.sin(x * 0.2) * 2 + 
          Math.cos(z * 0.2) * 2 + 
          Math.sin(x * 0.1 + z * 0.1) * 1.5
        );
        for (let y = 0; y <= height; y += 0.35) {
          const noise = Math.sin(x * 2.3 + z * 1.7 + y * 3.1) * 0.5 + 0.5;
          const colorIndex = Math.floor(noise * colors.length);
          const color = y === height ? colors[Math.min(colorIndex, colors.length - 1)] : colors[colors.length - 2];
          
          const scaleX = 0.8 + Math.sin(x * 17 + z * 13) * 0.4;
          const scaleY = 0.8 + Math.cos(y * 11 + x * 7) * 0.4;
          const scaleZ = 0.8 + Math.sin(z * 19 + y * 5) * 0.4;
          groundBlocks.push({ x, y, z, color, scaleX, scaleY, scaleZ });
        }
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

      const blocksNearby = blocks.filter(
        b => Math.abs(b.x - player.x) < 1 && Math.abs(b.z - player.z) < 1
      );
      const highestBlock = blocksNearby.reduce((max, b) => 
        b.y > max ? b.y : max, -1
      );
      const groundLevel = highestBlock + 1;

      if (highestBlock >= 0) {
        if (player.y <= groundLevel + 1.0) {
          player.y = groundLevel + 1.0;
          player.velocityY = 0;
          player.onGround = true;
        } else {
          player.onGround = false;
        }
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
        const dx = block.x - player.x;
        const dy = block.y - player.y + 1.0;
        const dz = block.z - player.z;

        const cosYaw = Math.cos(player.yaw);
        const sinYaw = Math.sin(player.yaw);
        const rx = dx * cosYaw - dz * sinYaw;
        const rz = dx * sinYaw + dz * cosYaw;

        const cosPitch = Math.cos(player.pitch);
        const sinPitch = Math.sin(player.pitch);
        const ry = dy * cosPitch - rz * sinPitch;
        const rzPitch = dy * sinPitch + rz * cosPitch;

        if (rzPitch <= 0.1) return;

        const screenX = halfWidth + (rx / rzPitch) * scale;
        const screenY = halfHeight - (ry / rzPitch) * scale;
        
        const scaleX = block.scaleX || 1;
        const scaleY = block.scaleY || 1;
        const scaleZ = block.scaleZ || 1;
        
        const radiusX = (0.7 * scaleX / rzPitch) * scale;
        const radiusY = (0.7 * scaleY / rzPitch) * scale;

        const brightness = Math.max(0.4, 1 - rzPitch / 30);
        const r = parseInt(block.color.slice(1, 3), 16);
        const g = parseInt(block.color.slice(3, 5), 16);
        const b = parseInt(block.color.slice(5, 7), 16);

        ctx.save();
        ctx.translate(screenX, screenY);
        
        const rotation = Math.sin(block.x * 5 + block.z * 3) * 0.3;
        ctx.rotate(rotation);
        ctx.scale(radiusX / radiusY, 1);

        const gradient = ctx.createRadialGradient(
          -radiusY * 0.4,
          -radiusY * 0.4,
          0,
          0,
          0,
          radiusY * 1.2
        );
        gradient.addColorStop(0, `rgb(${r * brightness * 1.4}, ${g * brightness * 1.4}, ${b * brightness * 1.4})`);
        gradient.addColorStop(0.5, `rgb(${r * brightness * 1.1}, ${g * brightness * 1.1}, ${b * brightness * 1.1})`);
        gradient.addColorStop(0.8, `rgb(${r * brightness * 0.8}, ${g * brightness * 0.8}, ${b * brightness * 0.8})`);
        gradient.addColorStop(1, `rgb(${r * brightness * 0.4}, ${g * brightness * 0.4}, ${b * brightness * 0.4})`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, radiusY, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(${r * brightness * 0.3}, ${g * brightness * 0.3}, ${b * brightness * 0.3}, 0.2)`;
        ctx.beginPath();
        ctx.ellipse(0, radiusY * 0.3, radiusY * 0.6, radiusY * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
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