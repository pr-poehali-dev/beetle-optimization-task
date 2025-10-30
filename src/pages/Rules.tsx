import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";

const Rules = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-primary pixel-font">Правила игры</h1>
          <Button variant="outline" onClick={() => navigate('/')} className="pixel-font">
            <Icon name="Home" size={20} className="mr-2" />
            Домой
          </Button>
        </div>

        <Card className="p-6 bg-card space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-accent mb-2 pixel-font flex items-center gap-2">
              <Icon name="Target" size={28} />
              Цель игры
            </h2>
            <p className="text-foreground pixel-font">
              Уничтожайте врагов, не давая им достичь нижней части экрана. Чем больше врагов уничтожите, тем выше ваш счёт!
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-accent mb-2 pixel-font flex items-center gap-2">
              <Icon name="Gamepad2" size={28} />
              Управление
            </h2>
            <ul className="space-y-2 text-foreground pixel-font">
              <li className="flex items-center gap-2">
                <Icon name="ArrowLeft" size={20} className="text-primary" />
                <span>← Стрелка влево - движение влево</span>
              </li>
              <li className="flex items-center gap-2">
                <Icon name="ArrowRight" size={20} className="text-primary" />
                <span>→ Стрелка вправо - движение вправо</span>
              </li>
              <li className="flex items-center gap-2">
                <Icon name="Zap" size={20} className="text-accent" />
                <span>Пробел - выстрел</span>
              </li>
              <li className="flex items-center gap-2">
                <Icon name="Pause" size={20} className="text-muted-foreground" />
                <span>Esc - пауза</span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-accent mb-2 pixel-font flex items-center gap-2">
              <Icon name="Heart" size={28} />
              Здоровье
            </h2>
            <p className="text-foreground pixel-font">
              У вас есть 100 единиц здоровья. Каждый враг, достигший нижней части экрана, отнимает 10 HP. Игра заканчивается при 0 HP.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-accent mb-2 pixel-font flex items-center gap-2">
              <Icon name="Star" size={28} />
              Очки
            </h2>
            <p className="text-foreground pixel-font">
              За каждого уничтоженного врага вы получаете 100 очков. Враги имеют 2 единицы здоровья и требуют двух попаданий.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-accent mb-2 pixel-font flex items-center gap-2">
              <Icon name="Lightbulb" size={28} />
              Советы
            </h2>
            <ul className="space-y-2 text-foreground pixel-font list-disc list-inside">
              <li>Держите курсор под врагами для точных выстрелов</li>
              <li>Не давайте врагам накапливаться внизу экрана</li>
              <li>Постоянно двигайтесь, чтобы покрыть больше площади</li>
              <li>Используйте паузу для передышки</li>
            </ul>
          </div>
        </Card>

        <div className="flex justify-center">
          <Button size="lg" onClick={() => navigate('/game')} className="pixel-font">
            <Icon name="Play" size={24} className="mr-2" />
            Начать игру
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Rules;
