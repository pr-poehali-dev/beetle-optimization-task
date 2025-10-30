import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

const Profile = () => {
  const navigate = useNavigate();

  const stats = {
    name: "КОСМОНАВТ",
    level: 15,
    experience: 7500,
    nextLevel: 10000,
    gamesPlayed: 127,
    totalScore: 185300,
    highScore: 15000,
    accuracy: 78,
    enemiesKilled: 2543,
    totalTime: "24ч 35м"
  };

  const achievements = [
    { icon: "Target", name: "Снайпер", description: "Точность выше 80%", completed: false },
    { icon: "Zap", name: "Быстрый стрелок", description: "1000 убийств", completed: true },
    { icon: "Trophy", name: "Чемпион", description: "Первое место в рейтинге", completed: true },
    { icon: "Clock", name: "Марафонец", description: "20+ часов игры", completed: true },
    { icon: "Star", name: "Мастер", description: "10000+ очков", completed: true },
    { icon: "Shield", name: "Выживший", description: "Выжить 10 минут", completed: false }
  ];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-primary pixel-font flex items-center gap-3">
            <Icon name="User" size={40} />
            Профиль
          </h1>
          <Button variant="outline" onClick={() => navigate('/')} className="pixel-font">
            <Icon name="Home" size={20} className="mr-2" />
            Домой
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-card md:col-span-2">
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-3xl font-bold text-foreground pixel-font">{stats.name}</h2>
                  <div className="text-accent text-xl pixel-font">Уровень {stats.level}</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground pixel-font">
                    <span>Опыт</span>
                    <span>{stats.experience} / {stats.nextLevel}</span>
                  </div>
                  <Progress value={(stats.experience / stats.nextLevel) * 100} className="h-3" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-muted-foreground pixel-font">Игр сыграно</div>
                  <div className="text-2xl font-bold text-primary pixel-font">{stats.gamesPlayed}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground pixel-font">Общий счёт</div>
                  <div className="text-2xl font-bold text-primary pixel-font">{stats.totalScore.toLocaleString()}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground pixel-font">Рекорд</div>
                  <div className="text-2xl font-bold text-accent pixel-font">{stats.highScore.toLocaleString()}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground pixel-font">Точность</div>
                  <div className="text-2xl font-bold text-accent pixel-font">{stats.accuracy}%</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground pixel-font">Убито врагов</div>
                  <div className="text-2xl font-bold text-destructive pixel-font">{stats.enemiesKilled.toLocaleString()}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground pixel-font">Время в игре</div>
                  <div className="text-2xl font-bold text-foreground pixel-font">{stats.totalTime}</div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card">
            <h3 className="text-2xl font-bold text-accent mb-4 pixel-font flex items-center gap-2">
              <Icon name="Award" size={28} />
              Ранг
            </h3>
            <div className="space-y-4">
              <div className="text-center">
                <Icon name="Trophy" size={80} className="text-accent mx-auto mb-2" />
                <div className="text-xl font-bold text-foreground pixel-font">Мастер</div>
                <div className="text-muted-foreground pixel-font">Топ 5%</div>
              </div>
              <Button className="w-full pixel-font" onClick={() => navigate('/leaderboard')}>
                <Icon name="BarChart" size={20} className="mr-2" />
                Рейтинг
              </Button>
            </div>
          </Card>
        </div>

        <Card className="p-6 bg-card">
          <h3 className="text-2xl font-bold text-accent mb-4 pixel-font flex items-center gap-2">
            <Icon name="Star" size={28} />
            Достижения
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className={`p-4 rounded border-2 transition-colors ${
                  achievement.completed
                    ? 'bg-primary/10 border-primary'
                    : 'bg-muted/20 border-border opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Icon 
                    name={achievement.icon as any} 
                    size={32} 
                    className={achievement.completed ? 'text-accent' : 'text-muted-foreground'} 
                  />
                  <div className="flex-1">
                    <div className="font-bold text-foreground pixel-font">{achievement.name}</div>
                    <div className="text-sm text-muted-foreground pixel-font">{achievement.description}</div>
                  </div>
                  {achievement.completed && (
                    <Icon name="Check" size={20} className="text-primary" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex justify-center gap-4">
          <Button size="lg" onClick={() => navigate('/game')} className="pixel-font">
            <Icon name="Play" size={24} className="mr-2" />
            Играть
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate('/settings')} className="pixel-font">
            <Icon name="Settings" size={24} className="mr-2" />
            Настройки
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
