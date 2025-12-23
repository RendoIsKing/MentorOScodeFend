import { Card } from '../ui/card';
import { User, Calendar, Trophy, Target } from 'lucide-react';

interface PersonalInfo {
  name: string;
  age: number;
  height: number;
  startDate: string;
  background: string;
  achievements: string[];
}

interface PersonalInfoWidgetProps {
  info: PersonalInfo;
}

export function PersonalInfoWidget({ info }: PersonalInfoWidgetProps) {
  return (
    <Card className="p-6 bg-gradient-to-br from-stats-primary/20 via-stats-primary/10 to-stats-secondary/20 backdrop-blur-sm border border-stats-primary/30">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-primary/80 to-accent">
          <User className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h3 className="text-foreground">Personal Information</h3>
          <p className="text-sm text-white">Your profile and background</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <Card className="p-3 md:p-4 bg-gradient-to-br from-muted to-secondary">
            <p className="text-xs md:text-sm text-white mb-0.5">Name</p>
            <p className="text-sm md:text-base text-foreground break-words">{info.name}</p>
          </Card>
          <Card className="p-3 md:p-4 bg-gradient-to-br from-muted to-secondary">
            <p className="text-xs md:text-sm text-white mb-0.5">Age</p>
            <p className="text-sm md:text-base text-foreground">{info.age} years</p>
          </Card>
          <Card className="p-3 md:p-4 bg-gradient-to-br from-muted to-secondary">
            <p className="text-xs md:text-sm text-white mb-0.5">Height</p>
            <p className="text-sm md:text-base text-foreground">{info.height} cm</p>
          </Card>
        </div>

        <Card className="p-4 bg-gradient-to-br from-primary/20 to-primary/30 border-2 border-primary/40">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="h-4 w-4 text-primary" />
            <p className="text-sm text-primary">Journey Started</p>
          </div>
          <p className="text-foreground">{info.startDate}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="h-4 w-4 text-yellow-400" />
            <p className="text-sm text-foreground">Past Achievements</p>
          </div>
          <ul className="space-y-2">
            {info.achievements.map((achievement, idx) => (
              <li key={idx} className="text-sm text-white flex items-start gap-2">
                <span className="text-yellow-400">★</span>
                <span>{achievement}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-4 bg-muted">
          <p className="text-sm text-white mb-2">Background</p>
          <p className="text-sm text-foreground">{info.background}</p>
        </Card>
      </div>
    </Card>
  );
}