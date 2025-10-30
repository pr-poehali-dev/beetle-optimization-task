import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-bold text-primary pixel-font">
            PIXEL SHOOTER
          </h1>
          <p className="text-xl text-muted-foreground pixel-font">
            Классическая ретро-стрелялка
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6 hover:border-primary transition-colors cursor-pointer bg-card" onClick={() => navigate('/game')}>
            <div className="flex items-center gap-4">
              <Icon name="Gamepad2" size={48} className="text-primary" />
              <div>
                <h3 className="text-2xl font-bold text-foreground pixel-font">Играть</h3>
                <p className="text-muted-foreground pixel-font">Начать новую игру</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:border-primary transition-colors cursor-pointer bg-card" onClick={() => navigate('/rules')}>
            <div className="flex items-center gap-4">
              <Icon name="BookOpen" size={48} className="text-accent" />
              <div>
                <h3 className="text-2xl font-bold text-foreground pixel-font">Правила</h3>
                <p className="text-muted-foreground pixel-font">Как играть</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:border-primary transition-colors cursor-pointer bg-card" onClick={() => navigate('/leaderboard')}>
            <div className="flex items-center gap-4">
              <Icon name="Trophy" size={48} className="text-accent" />
              <div>
                <h3 className="text-2xl font-bold text-foreground pixel-font">Рейтинг</h3>
                <p className="text-muted-foreground pixel-font">Таблица лидеров</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:border-primary transition-colors cursor-pointer bg-card" onClick={() => navigate('/profile')}>
            <div className="flex items-center gap-4">
              <Icon name="User" size={48} className="text-accent" />
              <div>
                <h3 className="text-2xl font-bold text-foreground pixel-font">Профиль</h3>
                <p className="text-muted-foreground pixel-font">Ваша статистика</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex justify-center">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => navigate('/settings')}
            className="pixel-font"
          >
            <Icon name="Settings" size={24} className="mr-2" />
            Настройки
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
