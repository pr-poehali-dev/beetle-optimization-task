import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Position {
  x: number;
  y: number;
}

interface Enemy {
  id: number;
  x: number;
  y: number;
  health: number;
}

interface Bullet {
  id: number;
  x: number;
  y: number;
}

const Game = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [playerPos, setPlayerPos] = useState<Position>({ x: 50, y: 80 });
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const spawnEnemy = useCallback(() => {
    const newEnemy: Enemy = {
      id: Date.now(),
      x: Math.random() * 90 + 5,
      y: 0,
      health: 2
    };
    setEnemies(prev => [...prev, newEnemy]);
  }, []);

  const shoot = useCallback(() => {
    const newBullet: Bullet = {
      id: Date.now(),
      x: playerPos.x,
      y: playerPos.y - 5
    };
    setBullets(prev => [...prev, newBullet]);
  }, [playerPos]);

  useEffect(() => {
    if (gameOver || isPaused) return;

    const enemySpawnInterval = setInterval(spawnEnemy, 2000);
    return () => clearInterval(enemySpawnInterval);
  }, [gameOver, isPaused, spawnEnemy]);

  useEffect(() => {
    if (gameOver || isPaused) return;

    const gameLoop = setInterval(() => {
      setEnemies(prev => {
        const updated = prev.map(enemy => ({ ...enemy, y: enemy.y + 1 }));
        const filtered = updated.filter(enemy => {
          if (enemy.y > 100) {
            setHealth(h => Math.max(0, h - 10));
            return false;
          }
          return true;
        });
        return filtered;
      });

      setBullets(prev => {
        const updated = prev.map(bullet => ({ ...bullet, y: bullet.y - 2 }));
        return updated.filter(bullet => bullet.y > 0);
      });

      setBullets(prevBullets => {
        const remainingBullets = [...prevBullets];
        
        setEnemies(prevEnemies => {
          return prevEnemies.map(enemy => {
            for (let i = remainingBullets.length - 1; i >= 0; i--) {
              const bullet = remainingBullets[i];
              const distance = Math.sqrt(
                Math.pow(enemy.x - bullet.x, 2) + Math.pow(enemy.y - bullet.y, 2)
              );
              
              if (distance < 5) {
                remainingBullets.splice(i, 1);
                const newHealth = enemy.health - 1;
                
                if (newHealth <= 0) {
                  setScore(s => s + 100);
                  return null;
                }
                
                return { ...enemy, health: newHealth };
              }
            }
            return enemy;
          }).filter((enemy): enemy is Enemy => enemy !== null);
        });

        return remainingBullets;
      });
    }, 50);

    return () => clearInterval(gameLoop);
  }, [gameOver, isPaused]);

  useEffect(() => {
    if (health <= 0) {
      setGameOver(true);
      toast({
        title: "Игра окончена!",
        description: `Ваш счёт: ${score}`,
        variant: "destructive"
      });
    }
  }, [health, score, toast]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver) return;

      switch(e.key) {
        case 'ArrowLeft':
          setPlayerPos(prev => ({ ...prev, x: Math.max(5, prev.x - 3) }));
          break;
        case 'ArrowRight':
          setPlayerPos(prev => ({ ...prev, x: Math.min(95, prev.x + 3) }));
          break;
        case ' ':
          shoot();
          break;
        case 'Escape':
          setIsPaused(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameOver, shoot]);

  const restartGame = () => {
    setPlayerPos({ x: 50, y: 80 });
    setEnemies([]);
    setBullets([]);
    setScore(0);
    setHealth(100);
    setGameOver(false);
    setIsPaused(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col p-4">
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" onClick={() => navigate('/')} className="pixel-font">
          <Icon name="Home" size={20} className="mr-2" />
          Домой
        </Button>
        
        <div className="flex gap-6 text-lg pixel-font">
          <div className="text-accent">Очки: {score}</div>
          <div className="text-destructive">HP: {health}</div>
        </div>
      </div>

      <div className="flex-1 relative bg-gradient-to-b from-card via-card to-background border border-border/50 rounded-2xl overflow-hidden shadow-2xl">
        {!gameOver && (
          <div
            className="absolute w-16 h-16 bg-gradient-to-br from-primary via-primary to-purple-600 rounded-lg shadow-lg shadow-primary/50 transition-all duration-100"
            style={{
              left: `${playerPos.x}%`,
              top: `${playerPos.y}%`,
              transform: 'translate(-50%, -50%)',
              clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)'
            }}
          />
        )}

        {bullets.map(bullet => (
          <div
            key={bullet.id}
            className="absolute w-3 h-8 bg-gradient-to-t from-accent to-blue-400 rounded-full shadow-lg shadow-accent/50 transition-all"
            style={{
              left: `${bullet.x}%`,
              top: `${bullet.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          />
        ))}

        {enemies.map(enemy => (
          <div
            key={enemy.id}
            className="absolute w-14 h-14 bg-gradient-to-br from-destructive to-red-600 rounded-xl shadow-lg shadow-destructive/50 transition-all duration-200"
            style={{
              left: `${enemy.x}%`,
              top: `${enemy.y}%`,
              transform: 'translate(-50%, -50%) rotate(45deg)',
              opacity: enemy.health / 2
            }}
          />
        ))}

        {(gameOver || isPaused) && (
          <div className="absolute inset-0 bg-background/95 backdrop-blur-md flex flex-col items-center justify-center gap-6">
            <h2 className="text-4xl font-bold text-primary pixel-font">
              {gameOver ? 'ИГРА ОКОНЧЕНА' : 'ПАУЗА'}
            </h2>
            <p className="text-2xl text-foreground pixel-font">Счёт: {score}</p>
            {gameOver && (
              <Button onClick={restartGame} size="lg" className="pixel-font">
                <Icon name="RotateCcw" size={24} className="mr-2" />
                Играть снова
              </Button>
            )}
            {isPaused && (
              <Button onClick={() => setIsPaused(false)} size="lg" className="pixel-font">
                <Icon name="Play" size={24} className="mr-2" />
                Продолжить
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 text-center text-muted-foreground pixel-font">
        Управление: ← → для движения, Пробел для стрельбы, Esc для паузы
      </div>
    </div>
  );
};

export default Game;