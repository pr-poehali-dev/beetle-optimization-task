import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  date: string;
}

const Leaderboard = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const mockData: LeaderboardEntry[] = [
      { rank: 1, name: "КОСМОНАВТ", score: 15000, date: "30.10.2025" },
      { rank: 2, name: "PIXEL_HERO", score: 12500, date: "29.10.2025" },
      { rank: 3, name: "RETRO_KING", score: 10200, date: "29.10.2025" },
      { rank: 4, name: "SHOOTER_PRO", score: 8900, date: "28.10.2025" },
      { rank: 5, name: "GAMER_123", score: 7600, date: "28.10.2025" },
      { rank: 6, name: "SPACE_ACE", score: 6400, date: "27.10.2025" },
      { rank: 7, name: "RETRO_FAN", score: 5200, date: "27.10.2025" },
      { rank: 8, name: "OLDSCHOOL", score: 4100, date: "26.10.2025" },
      { rank: 9, name: "PIXEL_MASTER", score: 3300, date: "26.10.2025" },
      { rank: 10, name: "ARCADE_LOVER", score: 2500, date: "25.10.2025" }
    ];
    setEntries(mockData);
  }, []);

  const getMedalIcon = (rank: number) => {
    switch(rank) {
      case 1: return <Icon name="Trophy" size={24} className="text-accent" />;
      case 2: return <Icon name="Medal" size={24} className="text-muted-foreground" />;
      case 3: return <Icon name="Award" size={24} className="text-primary" />;
      default: return <span className="w-6 text-center text-muted-foreground pixel-font">{rank}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-primary pixel-font flex items-center gap-3">
            <Icon name="Trophy" size={40} />
            Таблица лидеров
          </h1>
          <Button variant="outline" onClick={() => navigate('/')} className="pixel-font">
            <Icon name="Home" size={20} className="mr-2" />
            Домой
          </Button>
        </div>

        <Card className="p-6 bg-card">
          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-4 pb-3 border-b border-border text-muted-foreground pixel-font">
              <div className="col-span-1 text-center">Место</div>
              <div className="col-span-5">Игрок</div>
              <div className="col-span-3 text-right">Очки</div>
              <div className="col-span-3 text-right">Дата</div>
            </div>

            {entries.map((entry) => (
              <div
                key={entry.rank}
                className={`grid grid-cols-12 gap-4 p-3 rounded transition-colors ${
                  entry.rank <= 3 ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/50'
                }`}
              >
                <div className="col-span-1 flex items-center justify-center">
                  {getMedalIcon(entry.rank)}
                </div>
                <div className="col-span-5 flex items-center text-foreground pixel-font font-bold">
                  {entry.name}
                </div>
                <div className="col-span-3 flex items-center justify-end text-accent pixel-font font-bold">
                  {entry.score.toLocaleString()}
                </div>
                <div className="col-span-3 flex items-center justify-end text-muted-foreground pixel-font">
                  {entry.date}
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
          <Button size="lg" variant="outline" onClick={() => navigate('/profile')} className="pixel-font">
            <Icon name="User" size={24} className="mr-2" />
            Профиль
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
