
import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import HorizontalScroll from '@/components/HorizontalScroll';
import QuestItem from '@/components/QuestItem';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { List } from 'lucide-react';
import { Mission, missionService } from '@/services/missionService';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

const Home: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const { data: missions } = useQuery({
    queryKey: ['missions'],
    queryFn: missionService.getMissions,
    enabled: !!user,
  });

  const [timeDisplay, setTimeDisplay] = useState("00:00:00");
  const [timeBalance, setTimeBalance] = useState<number>(336); // Default to 336h if profile is missing

  const formatTimeBalance = (hours: number | undefined) => {
    if (hours === undefined || isNaN(hours)) return "00:00:00";
    const totalSeconds = Math.max(0, Math.floor(hours * 3600));
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  useEffect(() => {
    if (profile?.time_balance !== undefined) {
      setTimeBalance(profile.time_balance);
    } else if (profile && refreshProfile) {
      refreshProfile();
    }
  }, [profile, refreshProfile]);

  useEffect(() => {
    if (user && refreshProfile) {
      refreshProfile();
    }
  }, [user, refreshProfile]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeBalance((prevTime) => {
        if (prevTime === undefined || prevTime <= 0) return 0;
        const newTimeBalance = prevTime - (1 / 3600);
        setTimeDisplay(formatTimeBalance(newTimeBalance));
        return newTimeBalance;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getMissionsByType = (type: string) =>
    missions?.filter((m) => m.mission_type.toLowerCase().includes(type.toLowerCase())) || [];

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <Header showAction actionLabel="GO" />

      <div className="px-4 mb-4">
        <div className="flex justify-between text-xs mb-1">
          <div className="text-gray-400">
            <div>Streaks</div>
            <div className="text-playops-accent font-bold">{profile?.streak_days || 0} Days</div>
          </div>

          <div className="text-center">
            <div className="text-gray-400">Leaderboard Rank</div>
            <div className="flex items-center justify-center gap-1">
              <span className="text-playops-accent">⭐</span>
              <span className="text-white font-bold">#{profile?.rank || 'N/A'}</span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-gray-400">XP Points</div>
            <div className="flex items-center justify-end gap-1">
              <span className="text-playops-accent">⭐</span>
              <span className="text-white font-bold">{profile?.xp_points || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-4 bg-gray-900 rounded-lg py-4 flex justify-center items-center mb-4">
        <span className="text-3xl font-bold text-playops-accent">{timeDisplay}</span>
      </div>

      <div className="px-4 mb-2">
        <div className="flex justify-between mb-1">
          <span className="text-xs text-gray-400">Progress</span>
          <span className="text-xs text-gray-400">Level {profile?.level || 1}</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${Math.min(100, ((profile?.xp_points || 0) % 1000) / 10)}%`,
            }}
          ></div>
        </div>
      </div>

      <div className="text-center mb-4">
        <h2 className="text-xl font-semibold">
          Welcome {profile?.username?.split('@')[0] || user?.email?.split('@')[0] || 'Player'}
        </h2>
      </div>

      <HorizontalScroll className="px-4 mb-6" />

      <div className="px-4 mb-2 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <List className="w-5 h-5 text-playops-accent" />
          <h2 className="font-medium">Quest List</h2>
        </div>
      </div>

      <div className="px-4 space-y-3 mb-4">
        {!missions ? (
          Array(4)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="h-16 bg-gray-800 rounded-lg animate-pulse"></div>
            ))
        ) : (
          <>
            {getMissionsByType('qotd').length > 0 && (
              <QuestItem
                type="mission"
                title="QOTD"
                duration="+6h"
                onClick={() => navigate('/missions')}
              />
            )}
            {getMissionsByType('networking').length > 0 && (
              <QuestItem
                type="mission"
                title="Networking Event"
                duration="+12h"
                onClick={() => navigate('/missions')}
              />
            )}
            {getMissionsByType('small').length > 0 && (
              <QuestItem
                type="assignment"
                title="Small Workshop"
                duration="-18h"
                onClick={() => navigate('/missions')}
              />
            )}
            {getMissionsByType('big').length > 0 && (
              <QuestItem
                type="assignment"
                title="Big Workshop"
                duration="-36h"
                onClick={() => navigate('/missions')}
              />
            )}
            {getMissionsByType('future').length > 0 && (
              <QuestItem
                type="advanced"
                title="Future Ready Drop"
                duration="+12h"
                onClick={() => navigate('/missions')}
              />
            )}
            {getMissionsByType('speaker').length > 0 && (
              <QuestItem
                type="speaker"
                title="Speaker Session"
                duration="0h"
                onClick={() => navigate('/missions')}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
