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
    const colors = ['#22c55e', '#16a34a', '#15803d', '#78716c', '#57534e'];
    
    for (let x = -20; x < 20; x += 0.6) {
      for (let z = -20; z < 20; z += 0.6) {
        const height = Math.floor(
          Math.sin(x * 0.2) * 2 + 
          Math.cos(z * 0.2) * 1.5
        );
        
        for (let y = 0; y <= height; y += 0.6) {
          const noise = Math.sin(x * 2 + z * 2) * 0.5 + 0.5;
          const colorIndex = Math.floor(noise * colors.length);
          const color = y === height ? colors[Math.min(colorIndex, colors.length - 1)] : colors[colors.length - 2];
          
          const scaleX = 0.9 + Math.sin(x * 10 + z * 8) * 0.3;
          const scaleY = 0.9;
          const scaleZ = 0.9 + Math.sin(z * 12) * 0.3;
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

    const handleMouseClick = (e: MouseEvent) => {
      if (document.pointerLockElement !== canvasRef.current) return;
      
      const player = playerRef.current;
      const reach = 5;
      const dir = {
        x: -Math.sin(player.yaw) * Math.cos(player.pitch),
        y: Math.sin(player.pitch),
        z: -Math.cos(player.yaw) * Math.cos(player.pitch)
      };

      for (let dist = 0.1; dist < reach; dist += 0.1) {
        const checkX = player.x + dir.x * dist;
        const checkY = player.y + dir.y * dist;
        const checkZ = player.z + dir.z * dist;

        const hitBlock = blocks.find(b => 
          Math.abs(b.x - checkX) < 0.3 && 
          Math.abs(b.y - checkY) < 0.3 && 
          Math.abs(b.z - checkZ) < 0.3
        );

        if (hitBlock) {
          if (e.button === 0) {
            setBlocks(prev => prev.filter(b => b !== hitBlock));
          } else if (e.button === 2) {
            const placeX = Math.round(hitBlock.x);
            const placeY = Math.round(hitBlock.y + 0.6);
            const placeZ = Math.round(hitBlock.z);
            
            const exists = blocks.some(b => 
              Math.abs(b.x - placeX) < 0.3 && 
              Math.abs(b.y - placeY) < 0.3 && 
              Math.abs(b.z - placeZ) < 0.3
            );
            
            if (!exists) {
              setBlocks(prev => [...prev, {
                x: placeX,
                y: placeY,
                z: placeZ,
                color: '#15803d',
                scaleX: 0.9,
                scaleY: 0.9,
                scaleZ: 0.9
              }]);
            }
          }
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseClick);
    document.addEventListener('pointerlockchange', handlePointerLockChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseClick);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
    };
  }, [isLocked, blocks]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.focus();
    canvas.requestPointerLock();

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    let animationFrameId: number;
    let lastTime = performance.now();

    const gameLoop = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      const speed = 5 * deltaTime;
      const player = playerRef.current;
      const keys = keysRef.current;
      
      const forward = {
        x: -Math.sin(player.yaw),
        z: -Math.cos(player.yaw)
      };
      const right = {
        x: -Math.cos(player.yaw),
        z: Math.sin(player.yaw)
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
        player.x += right.x * speed;
        player.z += right.z * speed;
      }
      if (keys.d) {
        player.x -= right.x * speed;
        player.z -= right.z * speed;
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
        
        const size = (0.6 / rzPitch) * scale;
        const sizeX = size * scaleX;
        const sizeY = size * scaleY;

        const brightness = Math.max(0.5, 1 - rzPitch / 30);
        const r = parseInt(block.color.slice(1, 3), 16);
        const g = parseInt(block.color.slice(3, 5), 16);
        const b = parseInt(block.color.slice(5, 7), 16);

        const topColor = `rgb(${r * brightness * 1.2}, ${g * brightness * 1.2}, ${b * brightness * 1.2})`;
        const rightColor = `rgb(${r * brightness * 0.8}, ${g * brightness * 0.8}, ${b * brightness * 0.8})`;
        const leftColor = `rgb(${r * brightness * 0.6}, ${g * brightness * 0.6}, ${b * brightness * 0.6})`;

        const cubeOffset = sizeY * 0.4;
        
        ctx.fillStyle = topColor;
        ctx.beginPath();
        ctx.moveTo(screenX, screenY - sizeY - cubeOffset);
        ctx.lineTo(screenX + sizeX, screenY - sizeY * 0.5 - cubeOffset);
        ctx.lineTo(screenX, screenY - cubeOffset);
        ctx.lineTo(screenX - sizeX, screenY - sizeY * 0.5 - cubeOffset);
        ctx.closePath();
        ctx.fill();
        
        const pixelSize = Math.max(2, sizeX / 8);
        for (let i = 0; i < 5; i++) {
          const px = screenX + (Math.sin(block.x * 7 + i) - 0.5) * sizeX * 0.6;
          const py = screenY - sizeY * 0.5 - cubeOffset + (Math.cos(block.z * 5 + i) - 0.5) * sizeY * 0.3;
          ctx.fillStyle = `rgba(${r * brightness * 1.4}, ${g * brightness * 1.4}, ${b * brightness * 1.4}, 0.4)`;
          ctx.fillRect(px, py, pixelSize, pixelSize);
        }
        
        ctx.fillStyle = rightColor;
        ctx.beginPath();
        ctx.moveTo(screenX, screenY - cubeOffset);
        ctx.lineTo(screenX + sizeX, screenY - sizeY * 0.5 - cubeOffset);
        ctx.lineTo(screenX + sizeX, screenY + sizeY * 0.5 - cubeOffset);
        ctx.lineTo(screenX, screenY + sizeY - cubeOffset);
        ctx.closePath();
        ctx.fill();
        
        for (let i = 0; i < 3; i++) {
          const px = screenX + sizeX * 0.5 + (Math.sin(block.x * 9 + i) - 0.5) * sizeX * 0.3;
          const py = screenY - cubeOffset + (Math.cos(block.z * 7 + i) - 0.5) * sizeY * 0.6;
          ctx.fillStyle = `rgba(${r * brightness * 1.0}, ${g * brightness * 1.0}, ${b * brightness * 1.0}, 0.3)`;
          ctx.fillRect(px, py, pixelSize, pixelSize);
        }
        
        ctx.fillStyle = leftColor;
        ctx.beginPath();
        ctx.moveTo(screenX, screenY - cubeOffset);
        ctx.lineTo(screenX - sizeX, screenY - sizeY * 0.5 - cubeOffset);
        ctx.lineTo(screenX - sizeX, screenY + sizeY * 0.5 - cubeOffset);
        ctx.lineTo(screenX, screenY + sizeY - cubeOffset);
        ctx.closePath();
        ctx.fill();
        
        ctx.strokeStyle = `rgba(0, 0, 0, 0.15)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(screenX, screenY - sizeY - cubeOffset);
        ctx.lineTo(screenX + sizeX, screenY - sizeY * 0.5 - cubeOffset);
        ctx.lineTo(screenX, screenY - cubeOffset);
        ctx.lineTo(screenX - sizeX, screenY - sizeY * 0.5 - cubeOffset);
        ctx.closePath();
        ctx.stroke();
      });

      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fillRect(halfWidth - 2, halfHeight - 2, 4, 4);
      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      ctx.strokeRect(halfWidth - 10, halfHeight - 10, 20, 20);

      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(10, 10, 300, 100);
      ctx.fillStyle = 'white';
      ctx.font = '16px monospace';
      ctx.fillText(`X: ${player.x.toFixed(2)} Y: ${player.y.toFixed(2)} Z: ${player.z.toFixed(2)}`, 20, 35);
      ctx.fillText(`Keys: W=${keys.w} A=${keys.a} S=${keys.s} D=${keys.d}`, 20, 60);
      ctx.fillText(`Speed: ${speed.toFixed(3)} DeltaTime: ${deltaTime.toFixed(3)}`, 20, 85);

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
        className="w-full h-full cursor-crosshair outline-none"
        style={{ imageRendering: 'pixelated' }}
        onClick={() => canvasRef.current?.requestPointerLock()}
        onContextMenu={(e) => e.preventDefault()}
        tabIndex={0}
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
            <p className="text-xs">⌨️ W/A/S/D - движение</p>
            <p className="text-xs">🖱️ Мышь - обзор (автозахват)</p>
            <p className="text-xs">🖱️ ЛКМ - ломать блок</p>
            <p className="text-xs">🖱️ ПКМ - ставить блок</p>
            <p className="text-xs">⌨️ Пробел - прыжок</p>
            <p className="text-xs">⌨️ ESC - выход из блокировки</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SimpleGameScene;